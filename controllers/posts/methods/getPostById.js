const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Post = require('../../../models/post');

module.exports = wrapAsync(async (req, res) => {
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    res.status(400);
    return res.json({ message: 'postId 형식이 잘못되었습니다.' });
  }

  const post = await Post.findById(postId)
    .populate('author', 'profileName')
    .populate({
      path: 'category',
      populate: { path: 'parentId' },
    });

  if (!post) {
    return res.status(404).end();
  }

  res.status(200);
  return res.json({ post });
});
