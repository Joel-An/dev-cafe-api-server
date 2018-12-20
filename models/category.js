const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const options = { versionKey: false };

const categorySchema = new Schema({
  name: { type: String },
  parent: { type: ObjectId, ref: 'Category' },
  isChild: { type: Boolean, default: false },
}, options);

// eslint-disable-next-line func-names
categorySchema.pre('save', function (next) {
  if (this.parentId) { this.isChild = true; }
  next();
});


module.exports = mongoose.model('Category', categorySchema);
