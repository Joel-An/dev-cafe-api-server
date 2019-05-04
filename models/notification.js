const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const TYPES = {
  COMMENT_LIKES: 'COMMENT_LIKES',
  AUTHOR_HEART: 'AUTHOR_HEART',
  NEW_COMMENT_ON_MY_POST: 'NEW_COMMENT_ON_MY_POST',
  NEW_FELLOW_COMMENT: 'NEW_FELLOW_COMMENT',
  NEW_REPLY_ON_MY_COMMENT: 'NEW_REPLY_ON_MY_COMMENT',
  NEW_FELLOW_REPLY: 'NEW_FELLOW_REPLY',
};

const notificationSchema = new Schema({
  type: { type: String },
  post: { type: ObjectId, ref: 'Post' },

  comment: { type: ObjectId, ref: 'Comment' },
  parentComment: { type: ObjectId, ref: 'Comment' },
  childComment: { type: ObjectId, ref: 'Comment' },
  userId: { type: ObjectId, ref: 'User' },
  fromWhom: { type: ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
});

notificationSchema.static('getTypes', () => TYPES);


notificationSchema.methods.commentLikes = function setType() {
  this.type = TYPES.COMMENT_LIKES;
  return this;
};

notificationSchema.methods.authorHeart = function setType() {
  this.type = TYPES.AUTHOR_HEART;
  return this;
};

notificationSchema.methods.newCommentOnMyPost = function setType() {
  this.type = TYPES.NEW_COMMENT_ON_MY_POST;
  return this;
};

notificationSchema.methods.newFellowComment = function setType() {
  this.type = TYPES.NEW_FELLOW_COMMENT;
  return this;
};

notificationSchema.methods.newReplyOnMyComment = function setType() {
  this.type = TYPES.NEW_REPLY_ON_MY_COMMENT;
  return this;
};

notificationSchema.methods.newFellowReply = function setType() {
  this.type = TYPES.NEW_FELLOW_REPLY;
  return this;
};

module.exports = mongoose.model('Notification', notificationSchema);
