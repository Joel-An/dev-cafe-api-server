/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const Post = require('../models/post');
const Comment = require('../models/comment');

const reqGetPost = postId => requester
  .get(`${API_URI}/posts/${postId}`);

const reqGetPosts = (query) => {
  const queryString = query || '';
  return requester
    .get(`${API_URI}/posts?${queryString}`);
};

describe('Posts', () => {
  let token;
  let parentCategory;
  let childCategory;
  const user = copyAndFreeze(USER_ARRAY[0]);

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
    parentCategory = new TestCategory('parent');
    const parentC = await reqPostCategories(token, parentCategory);
    parentC.should.have.status(201);
    parentCategory._id = parentC.body.categoryId;

    // 하위 카테고리 생성
    childCategory = new TestCategory('child', parentC.body.categoryId);
    const childC = await reqPostCategories(token, childCategory);
    childC.should.have.status(201);
    childCategory._id = childC.body.categoryId;
  });

  after((done) => {
    dropDatabase(done);
  });

  describe('POST /posts', () => {
    before((done) => {
      clearCollection(Post, done);
    });

    afterEach((done) => {
      clearCollection(Post, done);
    });

    it('성공하면 201코드, postId를 반환한다', async () => {
      const testPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: childCategory._id,
      });
      const res = await reqPostPosts(token, testPost);
      res.should.have.status(201);
      res.body.should.have.property('postId');

      const post = await Post.findById(res.body.postId);
      should.exist(post);
      assert.equal(post.title, testPost.title);
      assert.equal(post.contents, testPost.contents);
      assert.equal(post.category, testPost.categoryId);
    });

    it('토큰이 없으면 401코드를 반환한다', async () => {
      const testPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: childCategory._id,
      });
      const res = await reqPostPosts(null, testPost);
      res.should.have.status(401);

      const post = await Post.findOne({ title: testPost.title });
      should.not.exist(post);
    });

    it('카테고리 id가 invalid하면 400코드를 반환한다', async () => {
      const wrongPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: 'WRONG_CATEGORY_ID',
      });

      const res = await reqPostPosts(token, wrongPost);
      res.should.have.status(400);

      const post = await Post.findOne({ title: wrongPost.title });
      should.not.exist(post);
    });

    it('제목, 내용, 카테고리 누락시 400코드를 반환한다', async () => {
      const titleX = new TestPost({
        title: '     ',
        contents: 'hello',
        categoryId: childCategory._id,
      });
      const contentsX = new TestPost({
        title: 'testTitle',
        contents: '     ',
        categoryId: childCategory._id,
      });
      const categoryX = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: null,
      });

      const res1 = reqPostPosts(token, titleX);
      const res2 = reqPostPosts(token, contentsX);
      const res3 = reqPostPosts(token, categoryX);

      const results = await Promise.all([res1, res2, res3]);
      results[0].should.have.status(400);
      results[1].should.have.status(400);
      results[2].should.have.status(400);

      const post = await Post.findOne({ title: contentsX.title });
      should.not.exist(post);
    });

    it('카테고리가 존재하지 않으면 404코드를 반환한다', async () => {
      const wrongPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: new ObjectId(),
      });

      const res = await reqPostPosts(token, wrongPost);
      res.should.have.status(404);

      const post = await Post.findOne({ title: wrongPost.title });
      should.not.exist(post);
    });
  });

  describe('GET /posts/:id', () => {
    let postId;
    let testPost;
    before(async () => {
      testPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: childCategory._id,
      });
      const res = await reqPostPosts(token, testPost);
      res.should.have.status(201);
      ({ postId } = res.body);
    });

    after((done) => {
      clearCollection(Post, done);
    });

    it('성공하면 200코드, post를 반환한다', async () => {
      const res = await reqGetPost(postId);
      res.should.have.status(200);

      const post = res.body;
      assert.equal(post.title, testPost.title);
      assert.equal(post.author.profileName, user.profileName);
      assert.equal(post.category.name, childCategory.name);
      assert.equal(post.category.parent.name, parentCategory.name);
    });

    it('post가 없으면 404코드를 반환한다', async () => {
      const res = await reqGetPost(new ObjectId());
      res.should.have.status(404);
      should.not.exist(res.body.post);
    });

    it('postId가 invalid하다면 400코드를 반환한다', async () => {
      const res = await reqGetPost('INVALID_ID');
      res.should.have.status(400);
      should.not.exist(res.body.post);
    });
  });

  describe('GET /posts', () => {
    before((done) => {
      clearCollection(Post, done);
    });

    context('글이 없으면', () => {
      before((done) => {
        clearCollection(Post, done);
      });

      it('404코드를 반환한다', async () => {
        const res = await reqGetPosts();
        res.should.have.status(404);
      });
    });

    context('성공하면', () => {
      let posts;
      before(async () => {
        const post1 = new TestPost({
          title: 'first post',
          contents: 'hello',
          categoryId: childCategory._id,
        });
        const post2 = new TestPost({
          title: '2nd post',
          contents: 'hihi',
          categoryId: childCategory._id,
        });

        const post3 = new TestPost({
          title: '3rd post',
          contents: 'jojojo',
          categoryId: parentCategory._id,
        });


        // 하위 카테고리에 글 2개, 상위에 1개 작성
        const reqP1 = await reqPostPosts(token, post1);
        const reqP2 = await reqPostPosts(token, post2);
        const reqP3 = await reqPostPosts(token, post3);

        reqP1.should.have.status(201);
        reqP2.should.have.status(201);
        reqP3.should.have.status(201);

        const { postId } = reqP1.body;

        const comment = new TestComment({
          contents: 'test',
          postId,
          parent: null,
        });

        // 첫 번재 글에 댓글 작성
        const res = await reqPostComments(token, comment);
        res.should.have.status(201);
      });

      it('200코드, 전체 posts를 반환한다', async () => {
        const res = await reqGetPosts();
        res.should.have.status(200);

        posts = res.body;
        assert.equal(posts.length, 3);
      });

      it('post에는 profileName이 있어야한다.', () => {
        assert.equal(posts[0].author.profileName, user.profileName);
      });

      it('post에는 상위,하위 카테고리정보가 있어야한다.', () => {
        assert.equal(posts[0].category.name, childCategory.name);
        assert.equal(posts[0].category.parent.name, parentCategory.name);
      });

      it('post에는 댓글 갯수가 있어야한다.', () => {
        assert.equal(posts[0].commentsCount, 1);
      });

      context('쿼리스트링으로 category를 지정하면', () => {
        it('200코드, 카테고리가 같은 글을 반환한다', async () => {
          const query = `category=${childCategory._id}`;
          const res = await reqGetPosts(query);

          res.should.have.status(200);

          const filterdPosts = res.body;
          assert.equal(filterdPosts.length, 2);
        });

        context('카테고리가 존재하지 않으면', () => {
          it('404코드를 반환한다', async () => {
            const query = `category=${new ObjectId()}`;
            const res = await reqGetPosts(query);

            res.should.have.status(404);
            res.body.should.not.have.property('posts');
          });
        });

        context('category(Id)가 invalid 하면', () => {
          it('400코드를 반환한다', async () => {
            const query = 'category=INVALID_ID';
            const res = await reqGetPosts(query);

            res.should.have.status(400);
            res.body.should.not.have.property('posts');
          });
        });

        context('허용하지 않는 쿼리 파라메터를 사용하면', () => {
          it('400코드를 반환한다', async () => {
            const query = 'isAdmin=true&&rmrf=true';
            const res = await reqGetPosts(query);

            res.should.have.status(400);
            res.body.should.not.have.property('posts');
          });
        });
      });

      after((done) => {
        clearCollection(Post, done);
      });
      after((done) => {
        clearCollection(Comment, done);
      });
    });
  });
});
