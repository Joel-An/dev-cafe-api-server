const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const commentId = req.params.id;
  const userId = new ObjectId(req.user._id);

  if (!ObjectId.isValid(commentId)) {
    res.status(400);
    return res.json({ message: 'commentId의 형식이 잘못되었습니다.' });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    res.status(404);
    return res.json({ message: '존재하지 않는 댓글입니다.' });
  }

  if (comment.isDeleted) {
    res.status(404);
    return res.json({ message: '삭제된 댓글입니다.' });
  }

  if (comment.likes.indexOf(userId) !== -1) {
    // likes[]에 ObjectId가 저장돼있어서 includes 사용 불가능
    res.status(409);
    return res.json({ message: '이미 좋아요를 누른 댓글입니다.' });
  }

  if (comment.dislikes.indexOf(userId) !== -1) {
    res.status(409);
    return res.json({ message: '이미 싫어요를 누른 댓글입니다.' });
  }

  await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });
  // 아이디 중복 저장을 막기위해 $push 대신 $addToSet 사용

  Socket.emitPostCommentLikes(userId, commentId);

  return res.status(204).end();
});
