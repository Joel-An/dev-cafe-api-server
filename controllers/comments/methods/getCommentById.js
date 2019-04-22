const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');

module.exports = wrapAsync(async (req, res) => {
  const commentId = req.params.id;

  if (!ObjectId.isValid(commentId)) {
    res.status(400);
    return res.json({ message: 'commentId의 형식이 잘못되었습니다.' });
  }

  const comment = await Comment.findById(commentId)
    .populate('author', 'profileName profilePic')
    .populate('authorHeart', 'profileName profilePic')
    .populate('likes', 'profileName profilePic')
    .populate('dislikes', 'profileName profilePic')
    .populate({
      path: 'childComments',
      populate: [
        {
          path: 'author',
          model: 'User',
          select: 'profileName profilePic',
        },
        {
          path: 'authorHeart',
          model: 'User',
          select: 'profileName profilePic',
        },
      ],
    });

  if (!comment) {
    return res.status(404).end();
  }

  res.status(200);
  return res.json(comment);
});
