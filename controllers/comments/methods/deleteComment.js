const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');

module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'commentId 형식이 잘못되었습니다.' });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).end();
  }

  await Comment.findByIdAndDelete(id);

  return res.status(204).end();
});
