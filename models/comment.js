/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new Schema({
  post: { type: ObjectId, ref: 'Post' },

  contents: { type: String, required: true },
  author: { type: ObjectId, ref: 'User' },

  parent: { type: ObjectId, ref: 'Comment', default: null },
  isChild: { type: Boolean, default: false },

  date: { type: Date, default: Date.now },
  isThisModified: { type: Boolean, default: false },
  modifiedDate: { type: Date },

  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },

  isDeleted: { type: Boolean, default: false },
});

// eslint-disable-next-line func-names
commentSchema.pre('save', function (next) {
  if (this.parent) { this.isChild = true; }
  next();
});

commentSchema.methods.isValidAuthor = function (id) {
  return this.authorInfo._id.equals(id);
};

module.exports = mongoose.model('Comment', commentSchema);
