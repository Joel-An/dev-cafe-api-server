const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Notification = require('../models/notification');
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
