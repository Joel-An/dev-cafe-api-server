const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync, checkDate } = require('../../../util/util');
const Post = require('../../../models/post');
const Comment = require('../../../models/comment');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'postId 형식이 잘못되었습니다.' });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).end();
  }

  if (post.author.toString() !== req.user._id) {
    res.status(401);
    return res.json({ message: '자신이 쓴 글만 삭제할 수 있습니다.' });
  }

  if (req.user.isTester) {
    await checkDate(post);
  }

  await Post.findByIdAndDelete(id);
  await Comment.deleteMany({ post: post._id });
  Socket.emitDeletePost(post._id, post.category);

  return res.status(204).end();
});
