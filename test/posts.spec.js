/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const {
  L, go, map,
} = require('fxjs2');

const Post = require('../models/post');
const Comment = require('../models/comment');

const App = require('./helpers/App');
const TestDataHelper = require('./helpers/TestDataHelper');

const {
  createPostInto,
  postPost,
  createCommentInto,
  createChildCommentOf,
  postComment,
  deletePost,
} = TestDataHelper;

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

    context('글이 있을 때', () => {
      let latestPost;

      const TOTAL_POSTS_IN_PARENT_CATEGORY = 20;
      const TOTAL_POSTS_IN_CHIILD_CATEGORY = 40;
      const TOTAL_POSTS = TOTAL_POSTS_IN_PARENT_CATEGORY + TOTAL_POSTS_IN_CHIILD_CATEGORY;

      const PARENT_COMMENTS = 2;
      const CHILD_COMMENTS = 3;
      const TOTAL_COMMENTS_IN_LATEST_POST = PARENT_COMMENTS + CHILD_COMMENTS;

      const DEFAULT_LIMIT = 30;

      before(async () => {
        /*  - parentCategory
                    - post20
                    - post19
                    ...
                    - post1

            - childCategory
                    - post40
                        - comment1
                            -childComment1
                            -childComment2
                            -childComment3
                        - comment2
                    - post39
                    - post38
                    ...
                    - post2
                    - post1
        */

        // 상위 카테고리에 글 20개 생성
        await go(
          L.range(TOTAL_POSTS_IN_PARENT_CATEGORY),
          map(createPostInto(parentCategory)),
          map(postPost(token)),
        );

        // 하위 카테고리에 글 40개 생성
        const postsInChildCategory = await go(
          L.range(TOTAL_POSTS_IN_CHIILD_CATEGORY),
          map(createPostInto(childCategory)),
          map(postPost(token)),
        );

        // 가장 최신 글에 댓글 2개 작성
        const lastPostIndex = postsInChildCategory.length - 1;
        latestPost = postsInChildCategory[lastPostIndex];

        const commentsInlatestPost = await go(
          L.range(PARENT_COMMENTS),
          map(createCommentInto(latestPost)),
          map(postComment(token)),
        );

        // 가장 최신 댓글에 답글(대댓글) 3개 작성
        const lastCommentIndex = commentsInlatestPost.length - 1;
        const latestCommnet = commentsInlatestPost[lastCommentIndex];

        await go(
          L.range(CHILD_COMMENTS),
          map(createChildCommentOf(latestCommnet)),
          map(postComment(token)),
        );
      });

      context('기본 GET /posts 요청이 성공하면', () => {
        let res;
        let posts;

        before(async () => {
          res = await App.reqGetPosts();
          posts = res.body;
        });

        it('200코드를 반환한다', () => {
          res.should.have.status(200);
        });
        it('헤더에 next-page-url이 포함되어 있다', () => {
          res.header.should.have.property('next-page-url');
        });
        it('limit이 설정되지 않은 경우, 30개의 글을 반환한다', () => {
          assert.notEqual(posts.length, TOTAL_POSTS);
          assert.equal(posts.length, DEFAULT_LIMIT);
        });
        it('최신 글이 목록의 첫번째에 위치한다', () => {
          assert.equal(posts[0]._id, latestPost._id);
        });
        it('post에는 작성자의 profileName이 있어야한다', () => {
          posts[0].author.should.have.property('profileName');
          assert(posts[0].author.profileName, user.profileName);
        });
        it('post에는 상위,하위 카테고리정보가 있어야한다', () => {
          assert.equal(posts[0].category.name, childCategory.name);
          assert.equal(posts[0].category.parent.name, parentCategory.name);
        });
        it('post에는 댓글 갯수가 있어야한다', () => {
          assert.equal(posts[0]._id, latestPost._id);
          assert.equal(posts[0].commentsCount, TOTAL_COMMENTS_IN_LATEST_POST);

          assert.equal(posts[1].commentsCount, 0);
        });
      });

      context('query parameter', () => {
        context('category(id)를 지정했을 때', () => {
          context('카테고리가 존재하면', () => {
            let res;
            let posts;

            before(async () => {
              const query = `category=${childCategory._id}&limit=${TOTAL_POSTS}`;
              res = await App.reqGetPosts(query);
              posts = res.body;
            });

            it('200코드를 반환한다', () => {
              res.should.have.status(200);
            });

            it('카테고리가 같은 글 목록을 반환한다', () => {
              posts.forEach((post) => {
                assert.equal(post.category.name, childCategory.name);
              });
            });
          });
          context('카테고리가 존재하지 않으면', () => {
            let res;

            before(async () => {
              const notExistCategory = new ObjectId();
              const query = `category=${notExistCategory}`;
              res = await App.reqGetPosts(query);
            });

            it('404코드를 반환한다', () => {
              res.should.have.status(404);
            });
          });
        });

        context('limit을 지정했을 때', () => {
          it('limit으로 지정한 갯수 만큼의 글을 반환한다', async () => {
            const limit = 15;
            const query = `limit=${limit}`;
            const res = await App.reqGetPosts(query);
            const posts = res.body;

            assert.equal(posts.length, limit);
          });

          it('limit보다 전체 글 갯수가 적다면 전체 글을 반환한다', async () => {
            const limit = 1000;
            const query = `limit=${limit}`;
            const res = await App.reqGetPosts(query);
            const posts = res.body;

            assert.notEqual(posts.length, limit);
            assert.equal(posts.length, TOTAL_POSTS);
          });
        });

        context('before/after을 지정했을 때', () => {
          let allPosts;
          before(async () => {
            const query = 'limit=100';
            const res = await App.reqGetPosts(query);
            allPosts = res.body;
          });

          context('before="beforeId"', () => {
            it('beforeId보다 오래된 글을 limit 혹은 최대 갯수 만큼 반환한다', async () => {
              const limit = 3;
              const beforeIndex = 10;
              const beforeId = allPosts[beforeIndex]._id;

              const query = `limit=${limit}&before=${beforeId}`;
              const res = await App.reqGetPosts(query);
              res.should.have.status(200);

              const responsePosts = res.body;

              const expectedPosts = [
                allPosts[11],
                allPosts[12],
                allPosts[13],
              ];

              responsePosts.forEach((responsePost, index) => {
                assert.deepEqual(responsePost, expectedPosts[index]);
              });
            });
          });
          context('after="afterId"', () => {
            let newPosts;
            before(async () => {
              // 새로운 글 3개 작성
              newPosts = await go(
                L.range(3),
                map(createPostInto(childCategory)),
                map(postPost(token)),
              );
            });

            after(async () => {
              // 추가한 글 3개 삭제
              await go(
                newPosts,
                map(deletePost(token))
              );
            });

            it('afterId보다 최신 글을 limit 만큼 반환한다', async () => {
              const limit = 3;
              const afterIndex = 10;
              const afterId = allPosts[afterIndex]._id;

              const query = `limit=${limit}&after=${afterId}`;
              const res = await App.reqGetPosts(query);
              res.should.have.status(200);

              const responsePosts = res.body;

              const expectedPosts = [
                newPosts[2],
                newPosts[1],
                newPosts[0],
              ];

              assert.equal(responsePosts[0]._id, expectedPosts[0]._id);
              assert.equal(responsePosts[1]._id, expectedPosts[1]._id);
              assert.equal(responsePosts[2]._id, expectedPosts[2]._id);
            });
          });

          context('after="afterId"&before="beforeId"', () => {
            it('afterId, beforeId 사이의 글을 limit 만큼 반환한다 ', async () => {
              const limit = 3;

              const afterIdIndex = 10;
              const beforeIdIndex = afterIdIndex - limit - 1;

              const afterId = allPosts[afterIdIndex]._id;
              const beforeId = allPosts[beforeIdIndex]._id;

              const query = `limit=${limit}&before=${beforeId}&after=${afterId}`;
              const res = await App.reqGetPosts(query);

              res.should.have.status(200);
              const responsePosts = res.body;

              const expectedPosts = [
                allPosts[7],
                allPosts[8],
                allPosts[9],
              ];

              responsePosts.forEach((responseComment, index) => {
                assert.equal(responseComment._id, expectedPosts[index]._id);
              });
            });
          });
        });

        context('invalid query parameter', () => {
          context('허용하지 않는 쿼리 파라메터를 사용하면', () => {
            it('400코드를 반환한다', async () => {
              const query = 'isAdmin=true&cOtegory=notCategory';
              const res = await App.reqGetPosts(query);
              res.should.have.status(400);
            });
          });

          context('invalid limit', () => {
            it('limit이 음수인 경우, default limit이 적용된다', async () => {
              const minusLimit = '-10';
              const query = `limit=${minusLimit}`;
              const res = await App.reqGetPosts(query);

              res.should.have.status(200);
              assert.equal(res.body.length, DEFAULT_LIMIT);
            });
            it('limit이 0인 경우, default limit이 적용된다', async () => {
              const invalidLimit = '0';
              const query = `limit=${invalidLimit}`;
              const res = await App.reqGetPosts(query);

              res.should.have.status(200);
              assert.equal(res.body.length, DEFAULT_LIMIT);
            });

            it('limit이 소수인 경우, 소숫점은 버림하여 적용된다', async () => {
              const invalidLimit = '8.92345';
              const query = `limit=${invalidLimit}`;
              const res = await App.reqGetPosts(query);

              res.should.have.status(200);
              assert.equal(res.body.length, 8);
            });

            it('limit이 문자열인 경우, default limit이 적용된다', async () => {
              const invalidLimit = 'ABCDE';
              const query = `limit=${invalidLimit}`;
              const res = await App.reqGetPosts(query);

              res.should.have.status(200);
              assert.equal(res.body.length, DEFAULT_LIMIT);
            });
          });
        });

        context('invalid before/after', () => {
          it('before or after가 ObjectId가 아니라면, 400 에러를 반환한다', async () => {
            const invalidId1 = 'ABCDE';
            const invalidId2 = '1321';
            const invalidId3 = '[@$@$';

            const query1 = `before=${invalidId1}`;
            const query2 = `after=${invalidId2}`;
            const query3 = `before=${invalidId3}`;
            const query4 = `before=${invalidId2}&after=${invalidId3}`;

            const req1 = App.reqGetPosts(query1);
            const req2 = App.reqGetPosts(query2);
            const req3 = App.reqGetPosts(query3);
            const req4 = App.reqGetPosts(query4);

            const responses = await Promise.all([req1, req2, req3, req4]);

            responses.forEach((response) => {
              response.should.have.status(400);
            });
          });
        });
      });

      context('헤더 next-page-url', () => {
        let allPosts;

        before(async () => {
          const query = 'limit=100';
          const res = await App.reqGetPosts(query);
          allPosts = res.body;
        });

        it('설정한 category(id)는 next-page-url에 반영된다', async () => {
          const query = `category=${childCategory._id}`;
          const res = await App.reqGetPosts(query);

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(query);
        });

        it('설정한 limit은 next-page-url에 반영된다', async () => {
          const limit = 10;
          const query = `limit=${limit}`;
          const res = await App.reqGetPosts(query);

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(query);
        });

        it('limit을 설정하지 않았다면 기본 limit이 next-page-url에 반영된다', async () => {
          const res = await App.reqGetPosts();

          const expectedLimit = `limit=${DEFAULT_LIMIT}`;

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(expectedLimit);
        });
        it('next-page-url을 이용하여 다음 페이지를 받아올 수 있다', async () => {
          const limit = 4;

          const query = `limit=${limit}`;
          const res = await App.reqGetPosts(query);
          const nextPageUrl = res.header['next-page-url'];

          const nextRes = await App.get(nextPageUrl);
          nextRes.should.have.status(200);

          const responsePosts = nextRes.body;
          const expectedPosts = [
            allPosts[4],
            allPosts[5],
            allPosts[6],
            allPosts[7],
          ];

          assert.equal(responsePosts.length, limit);
          assert.deepEqual(responsePosts, expectedPosts);
        });
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

      context('제목/내용이 없는 경우', () => {
        it('400코드를 반환한다', async () => {
          const emptyTitle = new TestPost({
            title: '',
            contents: 'where is the title',
            _id: postId,
          });
          const emptyContents = new TestPost({
            title: 'where is the contents',
            contents: '',
            _id: postId,
          });
          const resEmptyTitle = await App.reqUpdatePost(token, emptyTitle);
          const resEmptyContents = await App.reqUpdatePost(token, emptyContents);

          resEmptyTitle.should.have.status(400);
          resEmptyContents.should.have.status(400);

          const resGetPost = await App.reqGetPost(postId);
          const post = resGetPost.body;

          assert.notEqual(post.title, emptyTitle.title);
          assert.notEqual(post.contents, emptyContents.contents);
        });
      });

      context('수정하려는 글이 없는 경우', () => {
        it('404코드를 반환한다', async () => {
          const editedPost = new TestPost({
            title: 'will get 404 error',
            contents: 'will get 404 error',
            _id: new ObjectId(),
          });
          const res = await App.reqUpdatePost(token, editedPost);
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
          const res = await App.reqUpdatePost(token, editedPost);
          res.should.have.status(400);
        });
      });
    });
  });
});
