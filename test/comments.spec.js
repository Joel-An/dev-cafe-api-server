/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const {
  L, go, map, curry,
} = require('fxjs2');

const Comment = require('../models/comment');
const App = require('./helpers/App');

describe('comments', () => {
  let token;
  let post1;
  let post2;
  const user = copyAndFreeze(USER_ARRAY[0]);

  before((done) => {
    dropDatabase(done);
  });

  before(async () => {
    // 회원가입
    const register = await App.reqRegister(user);
    register.should.have.status(201);

    // 로그인
    const login = await App.reqLogin(user.username, user.password);
    login.should.have.status(201);
    token = login.body.accessToken;

    // 상위 카테고리 생성
    const parentCategory = new TestCategory('parent');
    const parentC = await App.reqPostCategory(token, parentCategory);
    parentC.should.have.status(201);

    // 하위 카테고리 생성
    const childCategory = new TestCategory('child', parentC.body.categoryId);
    const childC = await App.reqPostCategory(token, childCategory);
    childC.should.have.status(201);
    const childCategoryId = childC.body.categoryId;

    // 글 2개 작성
    post1 = new TestPost({
      title: 'post1',
      contents: 'post1',
      categoryId: childCategoryId,
    });
    post2 = new TestPost({
      title: 'post2',
      contents: 'post2',
      categoryId: childCategoryId,
    });

    const reqPost = App.reqPostPost(token, post1);
    const reqPost2 = App.reqPostPost(token, post2);

    const responses = await Promise.all([reqPost, reqPost2]);
    responses[0].should.have.status(201);
    responses[1].should.have.status(201);

    const postId1 = responses[0].body.postId;
    const postId2 = responses[1].body.postId;

    post1.setId(postId1);
    post2.setId(postId2);
  });

  after((done) => {
    dropDatabase(done);
  });

  describe('POST /comments', () => {
    after(async () => {
      await clearCollection(Comment);
    });

    it('성공하면 201코드, commentId를 반환한다', async () => {
      const testComment = new TestComment({
        contents: 'test',
        postId: post1._id,
        parent: null,
      });
      const res = await App.reqPostComment(token, testComment);
      res.should.have.status(201);
      res.body.should.have.property('commentId');

      const comment = await Comment.findById(res.body.commentId);
      should.exist(comment);
      assert.equal(comment.contents, testComment.contents);
      assert.equal(comment.post, testComment.postId);

      await clearCollection(Comment);
    });

    it('내용 or postId가 누락되면 400코드를 반환한다', async () => {
      const emptyContents = new TestComment({
        contents: '',
        postId: post1._id,
        parent: null,
      });

      const emptyPostId = new TestComment({
        contents: 'noPostId',
        postId: null,
        parent: null,
      });

      const req1 = App.reqPostComment(token, emptyContents);
      const req2 = App.reqPostComment(token, emptyPostId);

      const responses = await Promise.all([req1, req2]);

      responses[0].should.have.status(400);
      responses[1].should.have.status(400);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('postId가 invalid하면 400코드를 반환한다', async () => {
      const invalidPostId = new TestComment({
        contents: 'test',
        postId: 'INVALID_POST_ID',
        parent: null,
      });
      const res = await App.reqPostComment(token, invalidPostId);
      res.should.have.status(400);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('토큰이 누락되면 401코드를 반환한다', async () => {
      const testComment = new TestComment({
        contents: 'test',
        postId: post1._id,
        parent: null,
      });
      const res = await App.reqPostComment(null, testComment);
      res.should.have.status(401);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    it('post가 존재하지않으면 404코드를 반환한다', async () => {
      const notExistPostId = new TestComment({
        contents: 'test',
        postId: new ObjectId(),
        parent: null,
      });

      const res = await App.reqPostComment(token, notExistPostId);
      res.should.have.status(404);

      const comments = await Comment.find({});
      comments.length.should.be.equal(0);
    });

    context('자식 댓글을 생성할 때', () => {
      let parentCommentId;
      before(async () => {
        const parentComment = new TestComment({
          contents: 'parentComment',
          postId: post1._id,
          parent: null,
        });

        const resParent = await App.reqPostComment(token, parentComment);
        resParent.should.have.status(201);

        parentCommentId = resParent.body.commentId;
      });

      after(async () => {
        await clearCollection(Comment);
      });

      context('성공하면', () => {
        let childComment;
        let res;

        before(async () => {
          childComment = new TestComment({
            contents: 'childComment',
            postId: post1._id,
            parent: parentCommentId,
          });

          res = await App.reqPostComment(token, childComment);
        });

        it('201코드를 반환한다', async () => {
          res.should.have.status(201);
        });

        it('commentId를 반환한다', async () => {
          res.body.should.have.property('commentId');
        });

        it('DB에 댓글이 저장되어 있어야 한다', async () => {
          const childCommentId = res.body.commentId;

          const child = await Comment.findById(childCommentId);
          assert.equal(child.isChild, true);
          assert.equal(child.parent, childComment.parent);
        });

        it('부모댓글의 childComments에 자식댓글의 id가 저장된다', async () => {
          const childCommentId = res.body.commentId;

          const parent = await Comment.findById(parentCommentId);
          should.exist(parent);
          parent.childComments.should.include(childCommentId);
        });
      });

      it('부모댓글이 없으면 404코드를 반환한다', async () => {
        const orphanComment = new TestComment({
          contents: 'no Parent',
          postId: new ObjectId(),
          parent: null,
        });

        const res = await App.reqPostComment(token, orphanComment);
        res.should.have.status(404);

        const orphanDoc = await Comment
          .findOne({ contents: orphanComment.contents });
        should.not.exist(orphanDoc);
      });
      it('parentId가 invalid하면 400코드를 반환한다', async () => {
        const invalidParentId = new TestComment({
          contents: 'test',
          postId: 'INVALID_PARENTID',
          parent: null,
        });

        const res = await App.reqPostComment(token, invalidParentId);
        res.should.have.status(400);

        const invalidPidDoc = await Comment
          .findOne({ contents: invalidParentId.contents });
        should.not.exist(invalidPidDoc);
      });
    });
  });

  describe('GET /comments', () => {
    let commentsInPost1;
    let commentsInPost2;
    let childComments;

    const TOTAL_PARENT_COMMENTS_IN_POST1 = 40;
    const TOTAL_CHILD_COMMENTS_IN_POST1 = 2;
    const TOTAL_COMMENTS_IN_POST1 = TOTAL_PARENT_COMMENTS_IN_POST1 + TOTAL_CHILD_COMMENTS_IN_POST1;

    const TOTAL_PARENT_COMMENTS_IN_POST2 = 1;
    const TOTAL_CHILD_COMMENTS_IN_POST2 = 0;
    const TOTAL_COMMENTS_IN_POST2 = TOTAL_PARENT_COMMENTS_IN_POST2 + TOTAL_CHILD_COMMENTS_IN_POST2;

    const TOTAL_COMMENTS = TOTAL_COMMENTS_IN_POST1 + TOTAL_COMMENTS_IN_POST2;

    const DEFAULT_LIMIT = 30;

    after(async () => {
      await clearCollection(Comment);
    });
    context('댓글이 없으면', () => {
      it('404코드를 반환한다', async () => {
        const res = await App.reqGetComments();
        res.should.have.status(404);
      });
    });

    context('댓글이 있을 때', () => {
      before(async () => {
        /* - post1
              -comment1
              -comment2
              -comment3
              ...
              -comment39
              -comment40
                -comment40's child comment1
                -comment40's child comment2

            - post2
              -comment1
        */

        const postComment = curry(async (userToken, comment) => {
          const res = await App.reqPostComment(userToken, comment);
          const id = res.body.commentId;
          comment.setId(id);

          return comment;
        });

        const createCommentInto = curry((post, num = 0) => {
          const comment = new TestComment({
            contents: `test comment${num} in post ${post.title}`,
            postId: post._id,
          });

          return comment;
        });

        const createChildCommentOf = curry((comment, num = 0) => {
          const childComment = new TestComment({
            contents: `${comment.contents}'s child comment${num}`,
            postId: comment.postId,
            parent: comment._id,
          });

          return childComment;
        });

        // post1에 댓글 40개 작성
        commentsInPost1 = await go(
          L.range(TOTAL_PARENT_COMMENTS_IN_POST1),
          map(createCommentInto(post1)),
          map(postComment(token)),
        );

        // post2에 댓글 1개 작성
        commentsInPost2 = await go(
          L.range(TOTAL_PARENT_COMMENTS_IN_POST2),
          map(createCommentInto(post2)),
          map(postComment(token)),
        );

        // post1의 최신 댓글에 답글(자식 댓글) 2개 작성
        const latestComment = commentsInPost1[TOTAL_PARENT_COMMENTS_IN_POST1 - 1];

        childComments = await go(
          L.range(TOTAL_CHILD_COMMENTS_IN_POST1),
          map(createChildCommentOf(latestComment)),
          map(postComment(token)),
        );
      });

      context('기본 GET /comments 요청이 성공하면', () => {
        let response;
        let comments;

        before(async () => {
          response = await App.reqGetComments();
          comments = response.body;
        });

        it('200코드를 반환한다', () => {
          response.should.have.status(200);
        });

        it('헤더에 next-page-url이 포함되어 있다', () => {
          response.header.should.have.property('next-page-url');
        });

        it('limit이 설정되지 않은 경우, 30개의 댓글을 반환한다', () => {
          assert.notEqual(comments.length, TOTAL_COMMENTS);
          assert.equal(comments.length, DEFAULT_LIMIT);
        });

        it('최신 댓글이 목록의 마지막에 위치한다', async () => {
          for (let i = 0; i < comments.length - 1; i += 1) {
            const prevCommentDate = new Date(comments[i].date);
            const nextCommentDate = new Date(comments[i + 1].date);

            nextCommentDate.should.above(prevCommentDate);
          }
        });

        it('댓글에는 작성자의 profileName이 포함되어 있다', () => {
          comments.forEach((comment) => {
            comment.author.should.have.property('profileName');
            assert(comment.author.profileName, user.profileName);
          });
        });
      });

      context('post(Id)를 쿼리스트링으로 지정하면', () => {
        it('200코드, 해당되는 comments를 반환한다', async () => {
          const query = `post=${post2._id}`;
          const res = await App.reqGetComments(query);
          res.should.have.status(200);

          const comments = res.body;
          assert.equal(comments.length, TOTAL_COMMENTS_IN_POST2);
          assert.equal(comments[0]._id, commentsInPost2[0]._id);
        });

        context('자식댓글이 존재한다면', () => {
          it('200코드, 트리구조의 comments를 반환한다.', async () => {
            const query = `post=${post1._id}&limit=${TOTAL_PARENT_COMMENTS_IN_POST1}`;
            const res = await App.reqGetComments(query);
            res.should.have.status(200);

            const lastIndex = TOTAL_PARENT_COMMENTS_IN_POST1 - 1;

            const comments = res.body;
            assert.equal(comments[lastIndex].childComments.length, 2);
            assert.equal(comments[lastIndex].childComments[0]._id, childComments[0]._id);
            assert.equal(comments[lastIndex].childComments[1]._id, childComments[1]._id);
          });
        });
      });
      context('limit을 쿼리스트링으로 지정하면', () => {
        it('지정한 갯수만큼의 댓글을 반환한다', async () => {
          const limit = 3;
          const query = `limit=${limit}`;
          const res = await App.reqGetComments(query);
          res.should.have.status(200);

          const comments = res.body;
          assert.equal(comments.length, limit);
        });
        context('post(Id)를 쿼리스트링으로 설정했을 때', () => {
          it('limit으로 지정한 갯수 만큼의 부모 댓글을 반환한다', async () => {
            const limit = 3;

            const query = `post=${post1._id}&limit=${limit}`;
            const res = await App.reqGetComments(query);
            res.should.have.status(200);

            const comments = res.body;

            assert.equal(comments.length, limit);
            comments.forEach((comment) => {
              assert.equal(comment.isChild, false);
            });
          });

          it('limit보다 부모 댓글 갯수가 적다면 전체 부모 댓글을 반환한다', async () => {
            const query = `post=${post1._id}&limit=${TOTAL_COMMENTS_IN_POST1}`;
            const res = await App.reqGetComments(query);
            res.should.have.status(200);

            const comments = res.body;

            assert.equal(comments.length, TOTAL_PARENT_COMMENTS_IN_POST1);
            comments.forEach((comment) => {
              assert.equal(comment.isChild, false);
            });
          });
        });
      });

      context('before/after를 쿼리 파라메터로 지정했을 때', () => {
        let allComments;
        before(async () => {
          const query = 'limit=100';
          const res = await App.reqGetComments(query);
          allComments = res.body;
        });

        context('before="beforeId"', () => {
          it('beforeId보다 오래된 댓글을 limit 혹은 최대 갯수 만큼 반환한다', async () => {
            const limit = 10;
            const beforeIndex = 4;
            const beforeId = allComments[beforeIndex]._id;

            const query = `limit=${limit}&before=${beforeId}`;
            const res = await App.reqGetComments(query);
            const responseComments = res.body;

            // allComments[4] 보다 오래된 댓글은 [0,1,2,3] 밖에 없다.
            const expectedComments = [
              allComments[0],
              allComments[1],
              allComments[2],
              allComments[3],
            ];

            responseComments.forEach((responseComment, index) => {
              assert.equal(responseComment._id, expectedComments[index]._id);
              assert.equal(responseComment.contents, expectedComments[index].contents);
            });
          });
        });

        context('after="afterId"', () => {
          let newCommentIds;

          before(async () => {
            // 새로운 댓글 3개 등록
            const newComment = new TestComment({
              contents: 'new comment',
              postId: post1._id,
              parent: null,
            });

            const res1 = await App.reqPostComment(token, newComment);
            const res2 = await App.reqPostComment(token, newComment);
            const res3 = await App.reqPostComment(token, newComment);

            newCommentIds = [
              res1.body.commentId,
              res2.body.commentId,
              res3.body.commentId,
            ];
          });

          after(async () => {
            // 등록한 댓글 3개 제거
            const req1 = App.reqDeleteComment(token, newCommentIds[0]);
            const req2 = App.reqDeleteComment(token, newCommentIds[1]);
            const req3 = App.reqDeleteComment(token, newCommentIds[2]);

            await Promise.all([req1, req2, req3]);
          });

          it('afterId보다 최신 댓글을 limit 만큼 반환한다 ', async () => {
            // 원래 가지고 있던 댓글 중, 가장 최신 댓글을 기준으로 댓글 3개 요청
            const limit = 3;
            const afterIndex = allComments.length - 1;
            const afterId = allComments[afterIndex]._id;

            const query = `limit=${limit}&after=${afterId}`;
            const res = await App.reqGetComments(query);

            res.should.have.status(200);
            const responseComments = res.body;

            responseComments.forEach((responseComment, index) => {
              assert.equal(responseComment._id, newCommentIds[index]);
            });
          });
        });

        context('after="afterId"&before="beforeId"', () => {
          it('afterId, beforeId 사이의 댓글을 limit 만큼 반환한다 ', async () => {
            const limit = 3;
            const beforeIdIndex = 10;
            const afterIdIndex = beforeIdIndex - limit - 1;

            const afterId = allComments[afterIdIndex]._id;
            const beforeId = allComments[beforeIdIndex]._id;

            const query = `limit=${limit}&before=${beforeId}&after=${afterId}`;
            const res = await App.reqGetComments(query);

            res.should.have.status(200);
            const responseComments = res.body;

            const sliceFrom = afterIdIndex + 1;
            const sliceTo = beforeIdIndex;

            const expectedComments = allComments.slice(sliceFrom, sliceTo);
            assert.equal(expectedComments.length, limit);

            responseComments.forEach((responseComment, index) => {
              assert.equal(responseComment._id, expectedComments[index]._id);
            });
          });
        });
      });

      context('헤더 next-page-url', () => {
        let allComments;
        before(async () => {
          const query = 'limit=100';
          const res = await App.reqGetComments(query);
          allComments = res.body;
        });

        it('설정한 post(id)는 next-page-url에 반영된다', async () => {
          const query = `post=${post1._id}`;
          const res = await App.reqGetComments(query);

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(query);
        });

        it('설정한 limit은 next-page-url에 반영된다', async () => {
          const limit = 10;
          const query = `limit=${limit}`;
          const res = await App.reqGetComments(query);

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(query);
        });

        it('limit을 설정하지 않았다면 기본 limit이 next-page-url에 반영된다', async () => {
          const res = await App.reqGetComments();

          const expectedLimit = `limit=${DEFAULT_LIMIT}`;

          const nextPageUrl = res.header['next-page-url'];
          nextPageUrl.should.include(expectedLimit);
        });

        it('next-page-url을 이용하여 다음 페이지를 받아올 수 있다.', async () => {
          const limit = 3;

          const query = `limit=${limit}`;
          const res = await App.reqGetComments(query);
          const nextPageUrl = res.header['next-page-url'];

          const nextRes = await App.get(nextPageUrl);
          nextRes.should.have.status(200);

          const responseComments = nextRes.body;
          const expectedComments = [allComments[3], allComments[4], allComments[5]];

          assert.equal(responseComments.length, limit);
          assert.deepEqual(responseComments, expectedComments);
        });
      });


      context('post(Id)가 invalid하면', () => {
        it('400코드를 반환한다', async () => {
          const query = 'post=INVALID_POSTID';
          const res = await App.reqGetComments(query);
          res.should.have.status(400);
          res.body.should.not.have.property('comments');
        });
      });

      context('invalid limit', () => {
        it('limit이 음수인 경우, default limit이 적용된다', async () => {
          const invalidLimit = '-10';
          const query = `limit=${invalidLimit}`;
          const res = await App.reqGetComments(query);

          res.should.have.status(200);
          assert.equal(res.body.length, DEFAULT_LIMIT);
        });

        it('limit이 0인 경우, default limit이 적용된다', async () => {
          const invalidLimit = '0';
          const query = `limit=${invalidLimit}`;
          const res = await App.reqGetComments(query);

          res.should.have.status(200);
          assert.equal(res.body.length, DEFAULT_LIMIT);
        });

        it('limit이 소수인 경우, 소숫점은 버림하여 적용된다', async () => {
          const invalidLimit = '8.92345';
          const query = `limit=${invalidLimit}`;
          const res = await App.reqGetComments(query);

          res.should.have.status(200);
          assert.equal(res.body.length, 8);
        });

        it('limit이 문자열인 경우, default limit이 적용된다', async () => {
          const invalidLimit = 'ABCDE';
          const query = `limit=${invalidLimit}`;
          const res = await App.reqGetComments(query);

          res.should.have.status(200);
          assert.equal(res.body.length, DEFAULT_LIMIT);
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

          const req1 = App.reqGetComments(query1);
          const req2 = App.reqGetComments(query2);
          const req3 = App.reqGetComments(query3);
          const req4 = App.reqGetComments(query4);

          const responses = await Promise.all([req1, req2, req3, req4]);

          responses.forEach((response) => {
            response.should.have.status(400);
          });
        });
      });

      context('허용하지않는 쿼리 파라메터를 사용하면', () => {
        it('400코드를 반환한다', async () => {
          const wrongQuery = 'pAst=22&isAdmin=true';
          const res = await App.reqGetComments(wrongQuery);
          res.should.have.status(400);
          res.body.should.not.have.property('comments');
        });
      });
    });
  });

  describe('GET /comments/:id', () => {
    let testComment;
    let testCommentId;

    before(async () => {
      testComment = new TestComment({
        contents: 'test',
        postId: post1._id,
        parent: null,
      });
      const res = await App.reqPostComment(token, testComment);
      testCommentId = res.body.commentId;
    });

    after(async () => {
      await clearCollection(Comment);
    });

    it('성공하면 200코드, comment를 반환한다', async () => {
      const res = await App.reqGetComment(testCommentId);
      res.should.have.status(200);

      const comment = res.body;
      assert.equal(comment._id, testCommentId);
      assert.equal(comment.contents, testComment.contents);
    });

    it('comment가 없으면 404코드를 반환한다', async () => {
      const res = await App.reqGetComment(new ObjectId());
      res.should.have.status(404);
    });

    it('commentId가 invalid하다면 400코드를 반환한다', async () => {
      const invalidCommentId = 'invalidCommentId';
      const res = await App.reqGetComment(invalidCommentId);
      res.should.have.status(400);
    });
  });

  describe('DELETE /comments', () => {
    const postTestComments = async () => {
      // 부모 댓글 1개 등록
      const parentComment = new TestComment({
        contents: 'parent1 has 2 children',
        postId: post1._id,
        parent: null,
      });
      const resParent = await App.reqPostComment(token, parentComment);
      const parentId = resParent.body.commentId;

      // 자식 댓글 2개 등록
      const childComment1 = new TestComment({
        contents: 'child1',
        postId: post1._id,
        parent: parentId,
      });
      const childComment2 = new TestComment({
        contents: 'child2',
        postId: post1._id,
        parent: parentId,
      });

      const resChild1 = await App.reqPostComment(token, childComment1);
      const resChild2 = await App.reqPostComment(token, childComment2);

      const childId1 = resChild1.body.commentId;
      const childId2 = resChild2.body.commentId;

      // 자식이 없는 일반 댓글 1개 등록
      const normalComment = new TestComment({
        contents: 'comment has no child',
        postId: post1._id,
        parent: null,
      });
      const resNormal = await App.reqPostComment(token, normalComment);
      const normalCommentId = resNormal.body.commentId;

      return {
        parentId, childId1, childId2, normalCommentId,
      };
    };

    context('부모 댓글을 삭제할 때', () => {
      context('자식이 있는 경우', () => {
        let commentIds;
        let res;

        before(async () => {
          commentIds = await postTestComments();
          res = await App.reqDeleteComment(token, commentIds.parentId);
        });

        after(async () => {
          clearCollection(Comment);
        });

        it('204 코드를 반환한다', async () => {
          res.should.have.status(204);
        });

        it('부모댓글은 삭제되지 않는다', async () => {
          const resParent = await App.reqGetComment(commentIds.parentId);
          resParent.should.have.status(200);
        });

        it('부모댓글의 내용이 "삭제된 댓글입니다."로 바뀐다', async () => {
          const resParent = await App.reqGetComment(commentIds.parentId);

          const parentComment = resParent.body;
          assert.equal(parentComment.contents, '삭제된 댓글입니다.');
          assert.equal(parentComment.isDeleted, true);
        });
      });

      context('자식이 없는 경우', () => {
        let noChildCommentId;
        let res;

        before(async () => {
          const commentIds = await postTestComments();
          noChildCommentId = commentIds.normalCommentId;

          res = await App.reqDeleteComment(token, noChildCommentId);
        });

        after(async () => {
          clearCollection(Comment);
        });

        it('204 코드를 반환한다', async () => {
          res.should.have.status(204);
        });

        it('댓글은 삭제된다', async () => {
          const resNormalComment = await App.reqGetComment(noChildCommentId);
          resNormalComment.should.have.status(404);
        });
      });
    });

    context('자식 댓글을 삭제하면', () => {
      let commentIds;
      let res;

      before(async () => {
        commentIds = await postTestComments();
        res = await App.reqDeleteComment(token, commentIds.childId1);
      });

      after(async () => {
        clearCollection(Comment);
      });

      it('204 코드를 반환한다', async () => {
        res.should.have.status(204);
      });

      it('댓글은 삭제된다', async () => {
        const resChild1 = await App.reqGetComment(commentIds.childId1);
        resChild1.should.have.status(404);
      });

      it('부모댓글의 childComments가 갱신되어, 삭제된 자식 댓글은 제거된다', async () => {
        const resParent = await App.reqGetComment(commentIds.parentId);
        const parentComment = resParent.body;

        const resChild2 = await App.reqGetComment(commentIds.childId2);
        const childComment2 = resChild2.body;

        assert.equal(parentComment.childComments.length, 1);
        assert.deepInclude(parentComment.childComments, childComment2);
      });
    });

    context('invalid request', () => {
      let commentId;
      before(async () => {
        const commentIds = await postTestComments();
        commentId = commentIds.normalCommentId;
      });

      after(async () => {
        clearCollection(Comment);
      });

      context('자신의 댓글이 아닌 경우', () => {
        let otherUser;
        let tokenForOtherUser;
        before(async () => {
          // 회원가입
          otherUser = copyAndFreeze(USER_ARRAY[1]);
          const register = await App.reqRegister(otherUser);
          register.should.have.status(201);

          // 로그인
          const login = await App.reqLogin(otherUser.username, otherUser.password);
          login.should.have.status(201);
          tokenForOtherUser = login.body.accessToken;
        });

        after(async () => {
          // 회원 탈퇴
          const res = await App.reqUnregister(tokenForOtherUser, otherUser.password);
          res.should.have.status(204);
        });

        it('401코드를 반환한다', async () => {
          const res = await App.reqDeleteComment(tokenForOtherUser, commentId);
          res.should.have.status(401);

          const resComment = await App.reqGetComment(commentId);
          resComment.should.have.status(200);
        });
      });

      context('삭제하려는 댓글이 없는 경우', () => {
        it('404코드를 반환한다', async () => {
          const res = await App.reqDeleteComment(token, new ObjectId());
          res.should.have.status(404);
        });
      });

      context('commentId가 invalid한 경우', () => {
        it('400코드를 반환한다', async () => {
          const invalidCommentId = 'invalidCommentId';
          const res = await App.reqDeleteComment(token, invalidCommentId);
          res.should.have.status(400);
        });
      });
    });
  });
  describe('UPDATE /comments/:id', () => {
    let testComment;
    let testCommentId;
    before(async () => {
      // 테스트용 댓글 1개 등록
      testComment = new TestComment({
        contents: 'comment for update test',
        postId: post1._id,
        parent: null,
      });
      const res = await App.reqPostComment(token, testComment);
      testCommentId = res.body.commentId;
    });

    after(async () => {
      await clearCollection(Comment);
    });

    context('성공하면', () => {
      let editedComment;
      let updatedComment;

      let resUpdateComment;
      let resGetComment;

      before(async () => {
        editedComment = new TestComment({
          contents: 'edited contents',
          _id: testCommentId,
        });
        resUpdateComment = await App.reqUpdateComment(token, editedComment);
        resGetComment = await App.reqGetComment(testCommentId);
        updatedComment = resGetComment.body;
      });

      it('204 코드를 반환한다', async () => {
        resUpdateComment.should.have.status(204);
      });

      it('댓글 내용이 갱신된다', async () => {
        assert.equal(updatedComment.contents, editedComment.contents);
      });

      it('댓글의 수정 여부가 true로 설정되고, 수정 시간이 갱신된다', async () => {
        assert.equal(updatedComment.isThisModified, true);
        should.exist(updatedComment.modifiedDate);
        assert.equal(updatedComment.modifiedDate > updatedComment.date, true);
      });
    });

    context('invalid request', () => {
      context('자신의 댓글이 아닌 경우', () => {
        let otherUser;
        let tokenForOtherUser;
        before(async () => {
          // 회원가입
          otherUser = copyAndFreeze(USER_ARRAY[1]);
          const register = await App.reqRegister(otherUser);
          register.should.have.status(201);

          // 로그인
          const login = await App.reqLogin(otherUser.username, otherUser.password);
          login.should.have.status(201);
          tokenForOtherUser = login.body.accessToken;
        });

        after(async () => {
          // 회원 탈퇴
          const res = await App.reqUnregister(tokenForOtherUser, otherUser.password);
          res.should.have.status(204);
        });

        it('401코드를 반환한다', async () => {
          const editedComment = new TestComment({
            contents: 'edited contents again',
            _id: testCommentId,
          });
          const res = await App.reqUpdateComment(tokenForOtherUser, editedComment);
          res.should.have.status(401);

          const resGetComment = await App.reqGetComment(testCommentId);
          const comment = resGetComment.body;

          assert.notEqual(comment.contents, editedComment.contents);
        });
      });

      context('수정하려는 댓글이 없는 경우', () => {
        it('404코드를 반환한다', async () => {
          const editedComment = new TestComment({
            contents: 'will get 404 error',
            _id: new ObjectId(),
          });
          const res = await App.reqUpdateComment(token, editedComment);
          res.should.have.status(404);

          const resGetComment = await App.reqGetComment(testCommentId);
          const comment = resGetComment.body;

          assert.notEqual(comment.contents, editedComment.contents);
        });
      });

      context('commentId가 invalid한 경우', () => {
        it('400코드를 반환한다', async () => {
          const editedComment = new TestComment({
            contents: 'got invalid Id',
            _id: 'wrongId',
          });
          const res = await App.reqUpdateComment(token, editedComment);
          res.should.have.status(400);

          const resGetComment = await App.reqGetComment(testCommentId);
          const comment = resGetComment.body;

          assert.notEqual(comment.contents, editedComment.contents);
        });
      });
    });
  });
});
