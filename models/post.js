/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new Schema({
  category: { type: ObjectId, ref: 'Category' },

  title: { type: String, required: true },
  contents: { type: String, required: true },
  author: { type: ObjectId, ref: 'User' },

  date: { type: Date, default: Date.now },
  isThisModified: { type: Boolean, default: false },
  modifiedDate: { type: Date },
  isPromoted: { type: Boolean, default: false },
  promotedDate: { type: Date },

  viewed: { type: Number, default: 0 },

  upVotes: { type: Number, default: 0 },
  downVotes: { type: Number, default: 0 },
});

postSchema.methods.isValidAuthor = function (id) {
  return this.authorInfo._id.equals(id);
};

module.exports = mongoose.model('Post', postSchema);
