const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync, isEmptyInput } = require('../../../util/util');
const Post = require('../../../models/post');
const Category = require('../../../models/category');


module.exports = wrapAsync(async (req, res) => {
  const { title, contents, categoryId } = req.body;
  const userId = req.user._id;

  if (isEmptyInput(title, contents, categoryId)) {
    res.status(400);
    return res.json('누락된 파라메터가 있습니다.');
  }

  if (!ObjectId.isValid(categoryId)) {
    res.status(400);
    return res.json('categoryId 형식이 잘못되었습니다.');
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    return res.json('카테고리가 존재하지 않습니다.');
  }

  const post = new Post({
    title, contents, category: categoryId, author: userId,
  });

  await post.save();

  res.status(201);
  return res.json({ postId: post._id });
});
