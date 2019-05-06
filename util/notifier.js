const mongoose = require('mongoose');
const {
  go, C, L,
} = require('fxjs2');

const { ObjectId } = mongoose.Types;

const Notification = require('../models/notification');
const Comment = require('../models/comment');

const { userProjection } = require('../models/projectionFilters');

const Socket = require('./Socket');

const asyncExceptionCatcher = asyncFunc => (...args) => {
  asyncFunc(...args).catch(err => console.error(err));
};

const areEqualObjectIds = (oid1, oid2) => {
  const objectId1 = typeof oid1 === 'string' ? new ObjectId(oid1) : oid1;
  const objectId2 = typeof oid1 === 'string' ? new ObjectId(oid2) : oid2;

  return objectId1.equals(objectId2);
};

const populateNotification = notif => notif
  .populate('post', 'title')
  .populate('comment', 'contents')
  .populate({
    path: 'parentComment',
    select: 'contents author',
    populate: [
      {
        path: 'author',
        model: 'User',
        select: 'profileName',
      },
    ],
  })
  .populate('fromWhom', userProjection);
exports.populateNotification = populateNotification;

const notify = async (notification) => {
  const populatedNotif = await populateNotification(notification).execPopulate();

  Socket.emitNewNotification(populatedNotif.userId, populatedNotif);
};

exports.sendCommentLikesNotification = asyncExceptionCatcher(
  async (fromUserId, toUserId, commentId, postId) => {
    if (areEqualObjectIds(fromUserId, toUserId)) {
      return;
    }

    const notification = new Notification({
      fromWhom: fromUserId,
      userId: toUserId,
      comment: commentId,
      post: postId,
    }).commentLikes();

    await notify(await notification.save());
  }
);

exports.sendAuthorHeartNotification = asyncExceptionCatcher(
  async (fromUserId, toUserId, commentId, postId) => {
    if (areEqualObjectIds(fromUserId, toUserId)) {
      return;
    }

    const notification = new Notification({
      fromWhom: fromUserId,
      userId: toUserId,
      comment: commentId,
      post: postId,
    }).authorHeart();

    await notify(await notification.save());
  }
);


exports.sendNewCommentOnMyPostNotificaion = asyncExceptionCatcher(
  async (comment, post) => {
    if (areEqualObjectIds(comment.author, post.author)) {
      return;
    }

    const notification = new Notification({
      fromWhom: comment.author,
      userId: post.author,
      comment: comment._id,
      post: post._id,
    }).newCommentOnMyPost();

    await notify(await notification.save());
  }
);

const saveNotification = notification => notification.save();


exports.sendNewFellowCommentNotificaion = asyncExceptionCatcher(
  async (comment, post) => {
    const fellowComments = await Comment.aggregate([
      {
        $match: {
          post: post._id,
          isChild: false,
          isDeleted: false,
          author: { $nin: [comment.author, post.author] },
        },
      },
      {
        $group: {
          _id: null,
          authorId: {
            $addToSet: '$author',
          },
        },
      },
      {
        $unwind: {
          path: '$authorId',
        },
      },
    ]);

    await go(
      fellowComments,
      L.map(fellowComment => new Notification({
        fromWhom: comment.author,
        userId: fellowComment.authorId,
        comment: comment._id,
        post: post._id,
      }).newFellowComment()),
      L.map(saveNotification),
      C.map(notify),
    );
  }
);

exports.sendNewReplyOnMyCommentNotificaion = asyncExceptionCatcher(
  async (comment, reply) => {
    if (comment.isDeleted) {
      return;
    }

    if (areEqualObjectIds(comment.author, reply.author)) {
      return;
    }

    const notification = new Notification({
      fromWhom: reply.author,
      userId: comment.author,
      parentComment: comment._id,
      comment: reply._id,
      post: comment.post,
    }).newReplyOnMyComment();

    await notify(await notification.save());
  }
);

exports.sendNewFellowReplyNotificaion = asyncExceptionCatcher(
  async (comment, reply) => {
    const fellowReplies = await Comment.aggregate([
      {
        $match: {
          parent: comment._id,
          isChild: true,
          author: { $nin: [comment.author, reply.author] },
        },
      },
      {
        $group: {
          _id: null,
          authorId: {
            $addToSet: '$author',
          },
        },
      },
      {
        $unwind: {
          path: '$authorId',
        },
      },
    ]);

    await go(
      fellowReplies,
      L.map(fellowReply => new Notification({
        fromWhom: reply.author,
        userId: fellowReply.authorId,
        parentComment: comment._id,
        comment: reply._id,
        post: comment.post,
      }).newFellowReply()),
      L.map(saveNotification),
      C.map(notify),
    );
  }
);
