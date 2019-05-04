/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { go } = require('fxjs2');
const App = require('./helpers/App');
const Comment = require('../models/comment');
const Notification = require('../models/notification');

const {
  registerAndLogin,
  createCategory,
  postCategory,
  createPostInto,
  postPost,
  createCommentInto,
  createChildCommentOf,
  postComment,
} = require('./helpers/TestDataHelper');

describe('Notifications', () => {
  let token;
  let tokenForUser2;
  let tokenForUser3;
  let category;
  let myPost;
  let user2sPost;

  const user = copyAndFreeze(USER_ARRAY[0]);
  const user2 = copyAndFreeze(USER_ARRAY[1]);
  const user3 = copyAndFreeze(USER_ARRAY[2]);

  before((done) => {
    dropDatabase(done);
  });

  before(async () => {
    // 회원가입 & 로그인
    token = await registerAndLogin(user);
    tokenForUser2 = await registerAndLogin(user2);
    tokenForUser3 = await registerAndLogin(user3);

    // 카테고리 생성
    category = await go(
      createCategory('test category'),
      postCategory(token)
    );

    // 글 작성
    myPost = await go(
      createPostInto(category, 'my post'),
      postPost(token),
    );

    user2sPost = await go(
      createPostInto(category, 'others post'),
      postPost(tokenForUser2),
    );
  });

  describe('댓글 좋아요 알림', () => {
    let myComment;

    beforeEach(async () => {
      // 내 댓글 등록
      myComment = await go(
        createCommentInto(myPost, 'test comment'),
        postComment(token),
      );
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('다른 유저가 내 댓글을 좋아하면', () => {
      it('댓글 좋아요 알림이 등록된다', async () => {
        // when
        await App.reqPostCommentLikes(tokenForUser2, myComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);
        res.body.should.be.an('array');

        const [notification] = res.body;

        assert.property(notification, 'type');
        assert.strictEqual(notification.type, 'COMMENT_LIKES');
      });
    });

    context('다른 유저가 내 댓글 좋아요를 취소하면', () => {
      it('댓글 좋아요 알림이 제거된다', async () => {
        // given
        await App.reqPostCommentLikes(tokenForUser2, myComment._id);

        // when
        await App.reqDeleteCommentLikes(tokenForUser2, myComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('좋아요를 받은 내 댓글을 삭제하면', () => {
      it('댓글 좋아요 알림이 제거된다', async () => {
        // given
        await App.reqPostCommentLikes(tokenForUser2, myComment._id);

        // when
        await App.reqDeleteComment(token, myComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('내가 쓴 댓글에 좋아요를 누르면', () => {
      it('댓글 좋아요 알림이 등록되지 않는다', async () => {
        // when
        await App.reqPostCommentLikes(token, myComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('댓글 하트 알림', () => {
    let comment;

    beforeEach(async () => {
      // 내 댓글 등록
      comment = await go(
        createCommentInto(user2sPost, 'test comment'),
        postComment(token),
      );
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('글 작성자가 내 댓글에 하트를 주면', () => {
      it('댓글 하트 알림이 등록된다', async () => {
        // when
        await App.reqPostAuthorHeart(tokenForUser2, comment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);
        res.body.should.be.an('array');

        const [notification] = res.body;

        assert.property(notification, 'type');
        assert.strictEqual(notification.type, 'AUTHOR_HEART');
      });
    });

    context('글 작성자가 내 댓글에 준 하트를 취소하면', () => {
      it('댓글 하트 알림이 제거된다', async () => {
        // given
        await App.reqPostAuthorHeart(tokenForUser2, comment._id);

        // when
        await App.reqDeleteAuthorHeart(tokenForUser2, comment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('하트를 받은 내 댓글을 삭제하면', () => {
      it('댓글 하트 알림이 제거된다', async () => {
        // given
        await App.reqPostAuthorHeart(tokenForUser2, comment._id);

        // when
        await App.reqDeleteComment(token, comment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('내가 쓴 댓글에 하트를 주면', () => {
      it('댓글 하트 알림이 등록되지 않는다', async () => {
        // given
        const myComment = await go(
          createCommentInto(myPost, 'my comment in my post'),
          postComment(token),
        );

        // when
        await App.reqPostAuthorHeart(token, myComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('NEW COMMENT ON MY POST', () => {
    before(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('다른 유저가 내 글에 댓글을 달면', () => {
      it('댓글 알림이 등록된다', async () => {
        // when
        await go(
          createCommentInto(myPost, 'new comment on my post'),
          postComment(tokenForUser2),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const [notification] = res.body;

        assert.strictEqual(notification.type, Notification.getTypes().NEW_COMMENT_ON_MY_POST);
      });
    });

    context('다른 유저가 내 글에 남긴 댓글을 삭제하면', () => {
      it('댓글 알림이 제거된다', async () => {
        // given
        const comment = await go(
          createCommentInto(myPost, 'new comment on my post'),
          postComment(tokenForUser2),
        );

        // when
        await App.reqDeleteComment(tokenForUser2, comment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('내가 내 글에 댓글을 달면', () => {
      it('댓글 알림이 등록되지 않는다', async () => {
        // when
        await go(
          createCommentInto(myPost, 'my comment on my post'),
          postComment(token),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('NEW FELLOW COMMENT', () => {
    before(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('내가 댓글을 단 글에 누군가 댓글을 달면', () => {
      it('NEW FELLOW COMMENT 알림이 등록된다', async () => {
        // when
        await go(
          createCommentInto(user2sPost, "my comment on user2's post"),
          postComment(token),
        );

        await go(
          createCommentInto(user2sPost, "user3's comment on user2's post"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const [notification] = res.body;

        assert.strictEqual(notification.type, Notification.getTypes().NEW_FELLOW_COMMENT);
      });
    });

    context('내 글에 내가 댓글을 달았다면, 다른 사람이 댓글을 달아도', () => {
      it('NEW FELLOW COMMENT 알림은 등록되지 않는다', async () => {
        // given
        await go(
          createCommentInto(myPost, 'my comment on my post'),
          postComment(token),
        );

        // when
        await go(
          createCommentInto(myPost, "user2's comment on my post"),
          postComment(tokenForUser2),
        );

        await go(
          createCommentInto(myPost, "user3's comment on my post"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const notifications = res.body;

        notifications.forEach((notif) => {
          assert.notEqual(notif.type, Notification.getTypes().NEW_FELLOW_COMMENT);
        });
      });
    });

    context('다른 사람이 작성한 댓글을 삭제하면', () => {
      it('NEW FELLOW COMMENT 알림이 제거된다', async () => {
        // given
        await go(
          createCommentInto(user2sPost, "my comment on user2's post"),
          postComment(token),
        );

        const user3sComment = await go(
          createCommentInto(user2sPost, "user3's comment on user2's post"),
          postComment(tokenForUser3),
        );

        // when
        await App.reqDeleteComment(tokenForUser3, user3sComment._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('내 댓글이 "삭제처리"되면', () => {
      it('NEW FELLOW COMMENT 알림은 등록되지 않는다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, "my comment on user2's post"),
          postComment(token),
        );

        await go(
          createChildCommentOf(myComment, 'user3s reply on my comment'),
          postComment(tokenForUser3),
        );

        // 답글이 달린 댓글을 삭제해서 댓글을 '삭제처리' 상태로 만듦
        await App.reqDeleteComment(token, myComment._id);

        await App.reqPutNotificationCheckDate(token);

        // when
        await go(
          createCommentInto(user2sPost, "user3's comment on user2's post"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('NEW REPLY ON MY COMMENT', () => {
    before(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('다른 유저가 내 댓글에 답글을 달면', () => {
      it('NEW REPLY ON MY COMMENT 알림이 등록된다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, 'my comment on user2s post'),
          postComment(token),
        );

        // when
        await go(
          createChildCommentOf(myComment, 'user3s reply on my comment'),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const [notification] = res.body;

        assert.strictEqual(notification.type, Notification.getTypes().NEW_REPLY_ON_MY_COMMENT);
      });
    });

    context('내 댓글에 달린 답글이 삭제되면', () => {
      it('NEW REPLY ON MY COMMENT 알림이 제거된다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, 'my comment on user2s post'),
          postComment(token),
        );

        const reply = await go(
          createChildCommentOf(myComment, 'user3s reply on my comment'),
          postComment(tokenForUser3),
        );

        // when
        await App.reqDeleteComment(tokenForUser3, reply._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('내가 내 댓글에 답글을 달면', () => {
      it('NEW REPLY ON MY COMMENT 알림이 등록되지 않는다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, 'my comment on user2s post'),
          postComment(token),
        );
        // when
        await go(
          createChildCommentOf(myComment, 'my reply on my comment'),
          postComment(token),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });

    context('삭제 처리된 댓글에 답글을 달면', () => {
      it('NEW REPLY ON MY COMMENT 알림은 등록되지 않는다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, 'my comment on user2s post'),
          postComment(token),
        );

        await go(
          createChildCommentOf(myComment, 'user2s reply on my comment'),
          postComment(tokenForUser2),
        );

        // 답글이 있는 상태에서 댓글을 삭제하면 '삭제된 상태'로 변경됨
        await App.reqDeleteComment(token, myComment._id);

        // 알림 확인해서 기존의 답글 알림을 제거
        await App.reqPutNotificationCheckDate(token);

        // when
        await go(
          createChildCommentOf(myComment, 'user3s reply on deleted comment'),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('NEW FELLOW REPLY', () => {
    before(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    afterEach(async () => {
      await clearCollection(Comment);
      await clearCollection(Notification);
    });

    context('내가 답글을 단 댓글에 누군가 답글을 달면', () => {
      it('NEW FELLOW REPLY 알림이 등록된다', async () => {
        // given
        const user2sComment = await go(
          createCommentInto(user2sPost, "user2's comment on user2's post"),
          postComment(tokenForUser2),
        );

        await go(
          createChildCommentOf(user2sComment, "my reply on user2's comment"),
          postComment(token),
        );

        // when
        await go(
          createChildCommentOf(user2sComment, "user3's reply on user2's comment"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const [notification] = res.body;

        assert.strictEqual(notification.type, Notification.getTypes().NEW_FELLOW_REPLY);

        // population test
        assert.strictEqual(notification.parentComment.author.profileName, user2.profileName);
      });
    });

    context('내 댓글에 내가 답글을 달았다면, 다른 사람이 답글을 달아도', () => {
      it('NEW FELLOW REPLY 알림은 등록되지 않는다', async () => {
        // given
        const myComment = await go(
          createCommentInto(user2sPost, "my comment on user2's post"),
          postComment(token),
        );

        await go(
          createChildCommentOf(myComment, 'my reply on my comment'),
          postComment(token),
        );

        // when
        await go(
          createChildCommentOf(myComment, "user3's reply on my comment"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);

        const notifications = res.body;

        notifications.forEach((notif) => {
          assert.notEqual(notif.type, Notification.getTypes().NEW_FELLOW_REPLY);
        });
      });
    });

    context('댓글이 "삭제처리"되어도, 새 답글이 달리면', () => {
      it('NEW FELLOW REPLY 알림은 등록된다', async () => {
        // given
        const user2sComment = await go(
          createCommentInto(user2sPost, "user2's comment on user2's post"),
          postComment(tokenForUser2),
        );

        await go(
          createChildCommentOf(user2sComment, "my reply on user2's comment"),
          postComment(token),
        );

        // 답글이 달린 댓글을 삭제해서 댓글을 '삭제처리' 상태로 만듦
        await App.reqDeleteComment(tokenForUser2, user2sComment._id);

        // when
        await go(
          createChildCommentOf(user2sComment, "user3's reply on deleted comment"),
          postComment(tokenForUser3),
        );

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(200);
        assert.equal(res.body.length, 1);

        const [notification] = res.body;

        assert.strictEqual(notification.type, Notification.getTypes().NEW_FELLOW_REPLY);
      });
    });

    context('다른 사람이 자신의 답글을 삭제하면', () => {
      it('NEW FELLOW REPLY 알림이 제거된다', async () => {
        // given
        const user2sComment = await go(
          createCommentInto(user2sPost, "user2's comment on user2's post"),
          postComment(tokenForUser2),
        );

        await go(
          createChildCommentOf(user2sComment, "my reply on user2's comment"),
          postComment(token),
        );

        const user3sReply = await go(
          createChildCommentOf(user2sComment, "user3's reply on ser2's comment"),
          postComment(tokenForUser3),
        );

        // when
        await App.reqDeleteComment(tokenForUser3, user3sReply._id);

        // then
        const res = await App.reqGetNewNotifications(token);
        res.should.have.status(404);
      });
    });
  });

  describe('GET /users/me/newNotifications', () => {
    context('로그인 하지 않으면', () => {
      it('401 코드를 받는다', async () => {
        const res = await App.reqGetNewNotifications(null);
        res.should.have.status(401);
      });
    });

    context('새 알림이 없으면', () => {
      it('404 코드를 받는다', async () => {
        // given
        await clearCollection(Notification);

        // when
        const res = await App.reqGetNewNotifications(token);

        // then
        res.should.have.status(404);
      });
    });

    context('새 알림이 있을 때는', () => {
      let myComment;
      let response;
      let newNotifications;

      before(async () => {
        // 내 댓글 등록
        myComment = await go(
          createCommentInto(user2sPost, 'test comment'),
          postComment(token),
        );

        // 내 댓글에 좋아요 1개
        await App.reqPostCommentLikes(tokenForUser3, myComment._id);

        // 알림 확인
        await App.reqPutNotificationCheckDate(token);

        // 내 댓글에 좋아요 + 하트
        await App.reqPostCommentLikes(tokenForUser2, myComment._id);
        await App.reqPostAuthorHeart(tokenForUser2, myComment._id);

        // 알림 요청
        response = await App.reqGetNewNotifications(token);
        newNotifications = response.body;
      });

      after(async () => {
        await clearCollection(Comment);
        await clearCollection(Notification);
      });

      it('201코드와 새 알림 배열을 받는다', async () => {
        response.should.have.status(200);

        newNotifications.should.be.an('array');
        assert.equal(newNotifications.length, 2);
      });

      it('최신 알림이 목록의 첫번째에 위치해야한다', async () => {
        for (let i = 0; i < newNotifications.length - 1; i += 1) {
          const prevDate = new Date(newNotifications[i].date);
          const nextDate = new Date(newNotifications[i + 1].date);

          prevDate.should.above(nextDate);
        }
      });
    });
  });

  describe('GET /users/me/oldNotifications', () => {
    context('로그인 하지 않으면', () => {
      it('401 코드를 받는다', async () => {
        const res = await App.reqGetOldNotifications(null);
        res.should.have.status(401);
      });
    });

    context('확인한 알림이 없으면', () => {
      it('404 코드를 받는다', async () => {
        // given
        await clearCollection(Notification);

        // when
        const res = await App.reqGetOldNotifications(token);

        // then
        res.should.have.status(404);
      });
    });

    context('확인한 알림이 있을 때는', () => {
      let myComment;
      let response;
      let newNotifications;

      before(async () => {
        // 내 댓글 등록
        myComment = await go(
          createCommentInto(user2sPost, 'test comment'),
          postComment(token),
        );

        // 내 댓글에 좋아요 1개
        await App.reqPostCommentLikes(tokenForUser3, myComment._id);

        // 알림 확인
        await App.reqPutNotificationCheckDate(token);

        // 내 댓글에 좋아요 + 하트
        await App.reqPostCommentLikes(tokenForUser2, myComment._id);
        await App.reqPostAuthorHeart(tokenForUser2, myComment._id);

        // 확인한 알림 요청
        response = await App.reqGetOldNotifications(token);
        newNotifications = response.body;
      });

      after(async () => {
        await clearCollection(Comment);
        await clearCollection(Notification);
      });

      it('201코드와 새 알림 배열을 받는다', async () => {
        response.should.have.status(200);

        newNotifications.should.be.an('array');
        assert.equal(newNotifications.length, 1);
      });

      it('최신 알림이 목록의 첫번째에 위치해야한다', async () => {
        for (let i = 0; i < newNotifications.length - 1; i += 1) {
          const prevDate = new Date(newNotifications[i].date);
          const nextDate = new Date(newNotifications[i + 1].date);

          prevDate.should.above(nextDate);
        }
      });
    });
  });
});
