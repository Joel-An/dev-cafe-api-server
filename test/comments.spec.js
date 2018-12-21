/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const Comment = require('../models/comment');

describe('comments', () => {
  let token;
  const user = copyAndFreeze(USER_ARRAY[0]);
  const testComment = copyAndFreeze(sampleComment);
  const testCommentForPost2 = copyAndFreeze(sampleComment);

  const reqGetComments = (query) => {
    const queryString = query || '';
    return requester
      .get(`${API_URI}/comments?${queryString}`);
  };

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
    const parentC = await reqPostCategories(token, parentCategory);
    parentC.should.have.status(201);

    // 하위 카테고리 생성
    const childCategory = new TestCategory('child', parentC.body.categoryId);
    const childC = await reqPostCategories(token, childCategory);
    childC.should.have.status(201);


    // 글 2개 작성
    const testPost = copyAndFreeze(samplePost);
    const testPost2 = copyAndFreeze(samplePost);
    testPost.categoryId = childC.body.categoryId;
    testPost2.categoryId = childC.body.categoryId;

    const reqPost = reqPostPosts(token, testPost);
    const reqPost2 = reqPostPosts(token, testPost2);

    const responses = await Promise.all([reqPost, reqPost2]);
    responses[0].should.have.status(201);
    responses[1].should.have.status(201);

    testComment.postId = responses[0].body.postId;
    testCommentForPost2.postId = responses[1].body.postId;
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

    context('자식 댓글을 생성할 때', () => {
      let childComment;
      before(async () => {
        const parentComment = copyAndFreeze(testComment);
        childComment = copyAndFreeze(testComment);

        const resParent = await reqPostComments(token, parentComment);
        resParent.should.have.status(201);

        childComment.parent = resParent.body.commentId;
      });
      it('성공하면 201코드, commentId를 반환한다', async () => {
        const res = await reqPostComments(token, childComment);
        res.should.have.status(201);
        const childCommentId = res.body.commentId;

        const child = await Comment.findById(childCommentId);
        assert.equal(child.isChild, true);
        assert.equal(child.parent, childComment.parent);
      });
      it('부모댓글이 없으면 404코드를 반환한다', async () => {
        const orphanComment = copyAndFreeze(childComment);
        orphanComment.contents = 'no Parent';
        orphanComment.parent = new ObjectId();

        const res = await reqPostComments(token, orphanComment);
        res.should.have.status(404);

        const orphanDoc = await Comment
          .findOne({ contents: orphanComment.contents });
        should.not.exist(orphanDoc);
      });
      it('parentId가 invalid하면 400코드를 반환한다', async () => {
        const invalidParentId = copyAndFreeze(childComment);
        invalidParentId.contents = 'invalid parentId';
        invalidParentId.parent = 'INVALID_PARENTID';

        const res = await reqPostComments(token, invalidParentId);
        res.should.have.status(400);

        const invalidPidDoc = await Comment
          .findOne({ contents: invalidParentId.contents });
        should.not.exist(invalidPidDoc);
      });
    });
  });

  describe('GET /comments', () => {
    let commentId1;
    let commentId2;

    after((done) => {
      clearCollection(Comment, done);
    });
    context('댓글이 없으면', () => {
      it('404코드를 반환한다', async () => {
        const res = await reqGetComments();
        res.should.have.status(404);
      });
    });

    context('댓글이 있으면', () => {
      before(async () => {
        const req1 = reqPostComments(token, testComment);
        const req2 = reqPostComments(token, testCommentForPost2);

        const responses = await Promise.all([req1, req2]);
        responses[0].should.have.status(201);
        responses[1].should.have.status(201);

        responses[0].body.should.have.property('commentId');
        responses[1].body.should.have.property('commentId');

        commentId1 = responses[0].body.commentId;
        commentId2 = responses[1].body.commentId;
      });

      it('200코드, 전체 댓글을 반환한다', async () => {
        const res = await reqGetComments();
        res.should.have.status(200);

        res.body.should.have.property('comments');

        const { comments } = res.body;
        assert.equal(comments.length, 2);
        assert.equal(comments[0]._id, commentId1);
        assert.equal(comments[1]._id, commentId2);
      });

      context('post(Id)를 쿼리스트링으로 지정하면', () => {
        it('200코드, 해당되는 comments를 반환한다', async () => {
          const query = `post=${testComment.postId}`;
          const res = await reqGetComments(query);
          res.should.have.status(200);
          res.body.should.have.property('comments');

          const { comments } = res.body;
          assert.equal(comments.length, 1);
          assert.equal(comments[0]._id, commentId1);
        });
      });
      context('post(Id)가 invalid하면', () => {
        it('400코드를 반환한다', async () => {
          const query = 'post=INVALID_POSTID';
          const res = await reqGetComments(query);
          res.should.have.status(400);
          res.body.should.not.have.property('comments');
        });
      });
      context('허용하지않는 쿼리 파라메터를 사용하면', () => {
        it('400코드를 반환한다', async () => {
          const wrongQuery = 'pAst=22&isAdmin=true';
          const res = await reqGetComments(wrongQuery);
          res.should.have.status(400);
          res.body.should.not.have.property('comments');
        });
      });
    });
  });
});
