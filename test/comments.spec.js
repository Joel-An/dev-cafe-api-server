/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const Comment = require('../models/comment');

describe('comments', () => {
  let token;
  const user = copyAndFreeze(USER_ARRAY[0]);
  const testComment = copyAndFreeze(sampleComment);

  before((done) => {
    dropDatabase(done);
  });

  before(async () => {
    // 회원가입
    const register = await reqRegister(user);
    register.should.have.status(201);

    // 로그인
    const login = await reqLogin(user.username, user.password);
    login.should.have.status(201);
    token = login.body.accessToken;

    // 상위 카테고리 생성
    const parentCategory = new TestCategory('parent');
    const parentC = await reqPostCategories(parentCategory);
    parentC.should.have.status(201);

    // 하위 카테고리 생성
    const childCategory = new TestCategory('child', parentC.body.categoryId);
    const childC = await reqPostCategories(childCategory);
    childC.should.have.status(201);


    // 글 작성
    const testPost = copyAndFreeze(samplePost);
    testPost.categoryId = childC.body.categoryId;
    const post = await reqPostPosts(token, testPost);
    post.should.have.status(201);
    testComment.postId = post.body.postId;
  });

  after((done) => {
    dropDatabase(done);
  });

  describe('POST /comments', () => {
    afterEach((done) => {
      clearCollection(Comment, done);
    });

    it('성공하면 201코드, commentId를 반환한다', async () => {
      const res = await reqPostComments(token, testComment);
      res.should.have.status(201);
      res.body.should.have.property('commentId');

      const comment = await Comment.findById(res.body.commentId);
      should.exist(comment);
      assert.equal(comment.contents, testComment.contents);
      assert.equal(comment.post, testComment.postId);
    });

    it('내용 or postId가 누락되면 400코드를 반환한다', async () => {
      const emptyContents = copyAndFreeze(testComment);
      emptyContents.contents = '';

      const emptyPostId = copyAndFreeze(testComment);
      emptyPostId.postId = '';

      const req1 = reqPostComments(token, emptyContents);
      const req2 = reqPostComments(token, emptyPostId);

      const responses = await Promise.all([req1, req2]);

      responses[0].should.have.status(400);
      responses[1].should.have.status(400);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('postId가 invalid하면 400코드를 반환한다', async () => {
      const invalidPostId = copyAndFreeze(testComment);
      invalidPostId.postId = 'invalid_postId';
      const res = await reqPostComments(token, invalidPostId);
      res.should.have.status(400);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('토큰이 누락되면 401코드를 반환한다', async () => {
      const res = await reqPostComments(null, testComment);
      res.should.have.status(401);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('post가 존재하지않으면 404코드를 반환한다', async () => {
      const notExistPostId = copyAndFreeze(testComment);
      notExistPostId.postId = new ObjectId();
      const res = await reqPostComments(token, notExistPostId);
      res.should.have.status(404);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });
  });
});
