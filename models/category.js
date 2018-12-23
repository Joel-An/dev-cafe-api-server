const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const options = { versionKey: false };

const categorySchema = new Schema({
  name: { type: String },
  parent: { type: ObjectId, ref: 'Category', default: null },
  isChild: { type: Boolean, default: false },
}, options);

// eslint-disable-next-line func-names
categorySchema.pre('save', function (next) {
  if (this.parent) { this.isChild = true; }
  next();
});


module.exports = mongoose.model('Category', categorySchema);
