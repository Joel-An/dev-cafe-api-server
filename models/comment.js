const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const commentSchema = new Schema({
  postInfo: { type: ObjectId, ref: 'Post' },

  contents: { type: String, required: true },
  authorInfo: { _id: { type: ObjectId, ref: 'User' }, name: { type: String } },

  parentComment: { type: ObjectId, ref: 'Comment' },
  childComments: [{ type: ObjectId, ref: 'Comment' }],
  isChild: { type: Boolean, default: false },

  date: { type: Date, default: Date.now },
  isThisModified: { type: Boolean, default: false },
  modifiedDate: { type: Date },

  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },

  isDeleted: { type: Boolean, default: false },
});

commentSchema.methods.isValidAuthor = function (id) {
  return this.authorInfo._id.equals(id);
};

module.exports = mongoose.model('Comment', commentSchema);
