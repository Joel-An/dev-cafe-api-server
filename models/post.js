const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = new Schema({
  boardInfo: {
    _id: { type: ObjectId, ref: 'Board' },
    nameEng: { type: String },
    nameKor: { type: String },
  },

  title: { type: String, required: true },
  contents: { type: String, required: true },
  authorInfo: { _id: { type: ObjectId, ref: 'User' }, name: { type: String } },

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
