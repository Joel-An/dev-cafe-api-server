/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const Post = require('../models/post');
const Comment = require('../models/comment');

const App = require('./helpers/App');

describe('Posts', () => {
  let token;
  let parentCategory;
  let childCategory;
  const user = copyAndFreeze(USER_ARRAY[0]);

  let otherUserToken;
  const otherUser = copyAndFreeze(USER_ARRAY[1]);

  before((done) => {
    dropDatabase(done);
  });

  before(async () => {
    // 회원가입
    const registerUser = await App.reqRegister(user);
    registerUser.should.have.status(201);

    const registerOhterUser = await App.reqRegister(otherUser);
    registerOhterUser.should.have.status(201);

    // 로그인
    const userLogin = await App.reqLogin(user.username, user.password);
    userLogin.should.have.status(201);
    token = userLogin.body.accessToken;

    const ohtherUserLogin = await App.reqLogin(otherUser.username, otherUser.password);
    ohtherUserLogin.should.have.status(201);
    otherUserToken = ohtherUserLogin.body.accessToken;

    // 상위 카테고리 생성
    parentCategory = new TestCategory('parent');
    const parentC = await App.reqPostCategory(token, parentCategory);
    parentC.should.have.status(201);
    parentCategory._id = parentC.body.categoryId;

    // 하위 카테고리 생성
    childCategory = new TestCategory('child', parentC.body.categoryId);
    const childC = await App.reqPostCategory(token, childCategory);
    childC.should.have.status(201);
    childCategory._id = childC.body.categoryId;
  });

  after((done) => {
    dropDatabase(done);
  });

  describe('POST /posts', () => {
    before(async () => {
      await clearCollection(Post);
    });

    afterEach(async () => {
      await clearCollection(Post);
    });

    it('성공하면 201코드, postId를 반환한다', async () => {
      const testPost = new TestPost({
        title: 'testTitle',
        contents: 'hello',
        categoryId: childCategory._id,
      });
      const res = await App.reqPostPost(token, testPost);
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
      const res = await App.reqPostPost(null, testPost);
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

      const res = await App.reqPostPost(token, wrongPost);
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

      const res1 = App.reqPostPost(token, titleX);
      const res2 = App.reqPostPost(token, contentsX);
      const res3 = App.reqPostPost(token, categoryX);

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

      const res = await App.reqPostPost(token, wrongPost);
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
      const res = await App.reqPostPost(token, testPost);
      res.should.have.status(201);
      ({ postId } = res.body);
    });

    after(async () => {
      await clearCollection(Post);
    });

    it('성공하면 200코드, post를 반환한다', async () => {
      const res = await App.reqGetPost(postId);
      res.should.have.status(200);

      const post = res.body;
      assert.equal(post.title, testPost.title);
      assert.equal(post.author.profileName, user.profileName);
      assert.equal(post.category.name, childCategory.name);
      assert.equal(post.category.parent.name, parentCategory.name);
    });

    it('post가 없으면 404코드를 반환한다', async () => {
      const res = await App.reqGetPost(new ObjectId());
      res.should.have.status(404);
      should.not.exist(res.body.post);
    });

    it('postId가 invalid하다면 400코드를 반환한다', async () => {
      const res = await App.reqGetPost('INVALID_ID');
      res.should.have.status(400);
      should.not.exist(res.body.post);
    });
  });

  describe('GET /posts', () => {
    before(async () => {
      await clearCollection(Post);
    });

    context('글이 없으면', () => {
      before(async () => {
        await clearCollection(Post);
      });

      it('404코드를 반환한다', async () => {
        const res = await App.reqGetPosts();
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
        const reqP1 = await App.reqPostPost(token, post1);
        const reqP2 = await App.reqPostPost(token, post2);
        const reqP3 = await App.reqPostPost(token, post3);

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
        const res = await App.reqPostComment(token, comment);
        res.should.have.status(201);
      });

      it('200코드, 전체 posts를 반환한다', async () => {
        const res = await App.reqGetPosts();
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
          const res = await App.reqGetPosts(query);

          res.should.have.status(200);

          const filterdPosts = res.body;
          assert.equal(filterdPosts.length, 2);
        });

        context('카테고리가 존재하지 않으면', () => {
          it('404코드를 반환한다', async () => {
            const query = `category=${new ObjectId()}`;
            const res = await App.reqGetPosts(query);

            res.should.have.status(404);
            res.body.should.not.have.property('posts');
          });
        });

        context('category(Id)가 invalid 하면', () => {
          it('400코드를 반환한다', async () => {
            const query = 'category=INVALID_ID';
            const res = await App.reqGetPosts(query);

            res.should.have.status(400);
            res.body.should.not.have.property('posts');
          });
        });

        context('허용하지 않는 쿼리 파라메터를 사용하면', () => {
          it('400코드를 반환한다', async () => {
            const query = 'isAdmin=true&&rmrf=true';
            const res = await App.reqGetPosts(query);

            res.should.have.status(400);
            res.body.should.not.have.property('posts');
          });
        });
      });

      after(async () => {
        await clearCollection(Post);
      });
      after(async () => {
        await clearCollection(Comment);
      });
    });
  });

  describe('DELETE /posts/:id', () => {
    const setTestPostsAndComments = async () => {
      // 글 2개 작성, 첫 글에는 댓글 2개 작성
      const postIdWith2Comments = await postTestPost({
        token,
        postfix: 'has 2 comments',
        categoryId: childCategory._id,
      });

      const parentCommentId = await postTestComment({
        token,
        postId: postIdWith2Comments,
      });

      const childCommentId = await postTestComment({
        token,
        postId: postIdWith2Comments,
        parentCommentId,
      });

      const postIdWithoutComment = await postTestPost({
        token,
        postfix: 'doesn`t have comments',
        categoryId: childCategory._id,
      });

      return {
        postIdWith2Comments, parentCommentId, childCommentId, postIdWithoutComment,
      };
    };

    context('댓글이 있는 경우', () => {
      let ids;
      let resDeletePost;

      before(async () => {
        ids = await setTestPostsAndComments();

        // 글 삭제 요청
        resDeletePost = await App.reqDeletePost(token, ids.postIdWith2Comments);
      });

      after(async () => {
        await clearCollection(Post);
        await clearCollection(Comment);
      });

      it('204 코드를 반환한다', () => {
        resDeletePost.should.have.status(204);
      });

      it('DB에서 글이 삭제된다', async () => {
        const resGetPost = await App.reqGetPost(ids.postIdWith2Comments);
        resGetPost.should.have.status(404);
      });

      it('글에 달린 모든 댓글이 삭제된다', async () => {
        const resGetParentComment = await App.reqGetComment(ids.parentCommentId);
        resGetParentComment.should.have.status(404);

        const resGetChildComment = await App.reqGetComment(ids.childCommentId);
        resGetChildComment.should.have.status(404);
      });
    });

    context('댓글이 없는 경우', () => {
      let ids;
      let resDeletePost;

      before(async () => {
        ids = await setTestPostsAndComments();

        // 글 삭제 요청
        resDeletePost = await App.reqDeletePost(token, ids.postIdWithoutComment);
      });

      after(async () => {
        await clearCollection(Post);
        await clearCollection(Comment);
      });

      it('204 코드를 반환한다', () => {
        resDeletePost.should.have.status(204);
      });

      it('DB에서 글이 삭제된다', async () => {
        const resGetPost = await App.reqGetPost(ids.postIdWithoutComment);
        resGetPost.should.have.status(404);
      });
    });

    context('invalid request', () => {
      let postId;

      before(async () => {
        postId = await postTestPost({
          token,
          postfix: 'test post for invalid request',
          categoryId: childCategory._id,
        });
      });

      after(async () => {
        await clearCollection(Post);
      });

      context('자신의 글이 아닌 경우', () => {
        it('401코드를 반환한다', async () => {
          const resDeletePost = await App.reqDeletePost(otherUserToken, postId);
          resDeletePost.should.have.status(401);

          const resGetPost = await App.reqGetPost(postId);
          resGetPost.should.have.status(200);
        });
      });
      context('삭제하려는 글이 없는 경우', () => {
        it('404코드를 반환한다', async () => {
          const notExistPost = new ObjectId();
          const resDeletePost = await App.reqDeletePost(token, notExistPost);
          resDeletePost.should.have.status(404);
        });
      });
      context('postId가 invalid할 경우', () => {
        it('400코드를 반환한다', async () => {
          const invalidPostId = 'INVALID_POST_ID';
          const resDeletePost = await App.reqDeletePost(token, invalidPostId);
          resDeletePost.should.have.status(400);
        });
      });
    });
  });

  describe('UPDATE(PUT) /posts/:id', () => {
    let postId;

    before(async () => {
      postId = await postTestPost({
        token,
        postfix: 'test post for update request',
        categoryId: childCategory._id,
      });
    });

    after(async () => {
      await clearCollection(Post);
    });

    context('성공하면', () => {
      let resUpdatePost;

      let originalPost;
      let editedPost;
      let updatedPost;
      before(async () => {
        // 수정하기 전 글 저장
        const resGetOriginalPost = await App.reqGetPost(postId);
        originalPost = resGetOriginalPost.body;

        // 글 내용 수정
        editedPost = new TestPost({
          title: 'new title',
          contents: 'new contents',
          _id: originalPost._id,
        });

        // 수정된 글 갱신 요청
        resUpdatePost = await App.reqUpdatePost(token, editedPost);

        // 수정이 완료된 글 요청
        const resGetUpdatedPost = await App.reqGetPost(postId);
        updatedPost = resGetUpdatedPost.body;
      });

      it('204 코드를 반환한다', () => {
        resUpdatePost.should.have.status(204);
      });
      it('글의 내용이 갱신된다', async () => {
        assert.equal(updatedPost.title, editedPost.title);
        assert.equal(updatedPost.contents, editedPost.contents);
      });
      it('글의 수정 여부가 true로 설정되고, 수정 시간이 갱신된다', () => {
        assert.equal(updatedPost.isThisModified, true);

        should.exist(updatedPost.modifiedDate);
        assert.equal(updatedPost.modifiedDate > updatedPost.date, true);
      });
    });
    context('invalid request', () => {
      context('자신의 글이 아닌 경우', () => {
        it('401코드를 반환한다', async () => {
          const editedPost = new TestPost({
            title: 'edited title again',
            contents: 'edited contents again',
            _id: postId,
          });
          const res = await App.reqUpdatePost(otherUserToken, editedPost);
          res.should.have.status(401);

          const resGetPost = await App.reqGetPost(postId);
          const post = resGetPost.body;

          assert.notEqual(post.contents, editedPost.contents);
        });
      });

      context('수정하려는 글이 없는 경우', () => {
        it('404코드를 반환한다', async () => {
          const editedPost = new TestPost({
            title: 'will get 404 error',
            contents: 'will get 404 error',
            _id: new ObjectId(),
          });
          const res = await App.reqUpdatePost(otherUserToken, editedPost);
          res.should.have.status(404);
        });
      });

      context('postId가 invalid한 경우', () => {
        it('400코드를 반환한다', async () => {
          const editedPost = new TestPost({
            title: 'will get 400 error',
            contents: 'will get 400 error',
            _id: 'INVALID_POST_ID',
          });
          const res = await App.reqUpdatePost(otherUserToken, editedPost);
          res.should.have.status(400);
        });
      });
    });
  });
});
