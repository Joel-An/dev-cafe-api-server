const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync, isEmptyInput } = require('../../../util/util');
const Comment = require('../../../models/comment');
const Post = require('../../../models/post');

module.exports = wrapAsync(async (req, res) => {
  const { contents, postId, parent } = req.body;
  const userId = req.user._id;

  if (isEmptyInput(contents, postId)) {
    res.status(400);
    return res.json({ message: 'contents 또는 postId가 누락되었습니다' });
  }

  if (!ObjectId.isValid(postId)) {
    res.status(400);
    return res.json('postId 형식이 잘못되었습니다.');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    return res.json('존재하지 않는 글입니다.');
  }

  if (parent) {
    if (!ObjectId.isValid(parent)) {
      res.status(400);
      return res.json('parentId 형식이 잘못되었습니다.');
    }

    const parentComment = await Comment.findById(parent);

    if (!parentComment) {
      res.status(404);
      return res.json('부모 댓글이 존재하지 않습니다.');
    }
  }

  const comment = new Comment({
    contents, author: userId, post: postId, parent,
  });
  await comment.save();

  res.status(201);
  return res.json({ commentId: comment._id });
});
