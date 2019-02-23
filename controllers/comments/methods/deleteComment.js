const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync, checkDate } = require('../../../util/util');
const Comment = require('../../../models/comment');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'commentId 형식이 잘못되었습니다.' });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    res.status(404);
    return res.json({ message: '댓글이 존재하지 않습니다.' });
  }

  if (comment.author.toString() !== req.user._id) {
    res.status(401);
    return res.json({ message: '자신이 쓴 댓글만 삭제할 수 있습니다.' });
  }

  if (req.user.isTester) {
    await checkDate(comment);
  }

  if (comment.isDeleted) {
    res.status(401);
    return res.json({ message: '이미 삭제처리된 댓글입니다.' });
  }

  if (comment.childComments.length > 0) {
    await Comment.findByIdAndUpdate(comment._id, { $set: { contents: '삭제된 댓글입니다.', isDeleted: true } });
    Socket.emitUpdateComment(comment._id, comment.post);
  } else {
    await Comment.findByIdAndUpdate(comment.parent, { $pull: { childComments: comment._id } });
    await Comment.findByIdAndDelete(comment._id);
    Socket.emitDeleteComment(comment._id, comment.post);
  }

  return res.status(204).end();
});
