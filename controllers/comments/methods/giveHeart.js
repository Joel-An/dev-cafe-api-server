const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');
const { sendAuthorHeartNotification } = require('../../../util/notifier');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id;

  if (!ObjectId.isValid(commentId)) {
    res.status(400);
    return res.json({ message: 'commentId의 형식이 잘못되었습니다.' });
  }

  const comment = await Comment.findById(commentId).populate('post', 'author');

  if (!comment) {
    res.status(404);
    return res.json({ message: '존재하지 않는 댓글입니다.' });
  }

  if (comment.isDeleted) {
    res.status(404);
    return res.json({ message: '삭제된 댓글에는 하트를 줄 수 없습니다.' });
  }

  if (!comment.post.author.equals(userId)) {
    res.status(401);
    return res.json({ message: '하트를 줄 권한이 없습니다.' });
  }

  if (comment.authorHeart) {
    res.status(409);
    return res.json({ message: '이미 하트를 준 댓글입니다.' });
  }

  await Comment.findOneAndUpdate({ _id: commentId }, { authorHeart: userId });

  sendAuthorHeartNotification(comment.post.author, comment.author, commentId, comment.post);

  Socket.emitPostHeart(commentId, userId);
  return res.status(204).end();
});
