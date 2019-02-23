const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync, isEmptyInput, checkDate } = require('../../../util/util');
const Comment = require('../../../models/comment');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { contents: editedContents } = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'commentId 형식이 잘못되었습니다.' });
  }

  if (isEmptyInput(editedContents)) {
    res.status(400);
    return res.json({ message: '댓글 내용이 있어야합니다.' });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).end();
  }

  if (comment.author.toString() !== req.user._id) {
    res.status(401);
    return res.json({ message: '자신이 쓴 댓글만 수정할 수 있습니다.' });
  }

  if (req.user.isTester) {
    await checkDate(comment);
  }

  if (comment.isDeleted) {
    res.status(401);
    return res.json({ message: '삭제된 댓글은 수정할 수 없습니다.' });
  }

  await Comment.findByIdAndUpdate(id,
    {
      $set: {
        contents: editedContents,
        isThisModified: true,
        modifiedDate: Date.now(),
      },
    });

  Socket.emitUpdateComment(comment._id, comment.post);

  return res.status(204).end();
});
