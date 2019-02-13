const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync, isEmptyInput } = require('../../../util/util');
const Post = require('../../../models/post');

const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const {
    title: editedTitle,
    contents: editedContents,
  } = req.body;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'postId 형식이 잘못되었습니다.' });
  }

  if (isEmptyInput(editedTitle, editedContents)) {
    res.status(400);
    return res.json({ message: '제목/내용을 입력해주세요.' });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).end();
  }

  if (post.author.toString() !== req.user._id) {
    res.status(401);
    return res.json({ message: '자신이 쓴 글만 수정할 수 있습니다.' });
  }

  await Post.findByIdAndUpdate(id,
    {
      $set: {
        title: editedTitle,
        contents: editedContents,
        isThisModified: true,
        modifiedDate: Date.now(),
      },
    });

  Socket.emitUpdatePost(post._id, post.category);

  return res.status(204).end();
});
