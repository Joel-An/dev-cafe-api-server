const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync, isEmptyInput } = require('../../../util/util');
const Category = require('../../../models/category');


module.exports = wrapAsync(async (req, res) => {
  const { name, parent } = req.body;

  if (isEmptyInput(name)) {
    res.status(400);
    return res.json({ message: '카테고리이름을 입력해주세요.' });
  }

  if (!isEmptyInput(parent)) {
    if (!ObjectId.isValid(parent)) {
      res.status(400);
      return res.json({ message: 'parentId의 형식이 잘못되었습니다.' });
    }

    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      res.status(404);
      return res.json({ message: '상위 카테고리가 존재하지 않습니다.' });
    }
  }

  const oldCategory = await Category.findOne({ name });
  if (oldCategory) {
    return res.status(409).json({ message: '동일한 카테고리 이름이 존재합니다.' });
  }

  const category = new Category({ name, parent });
  await category.save();

  res.status(201);
  return res.json({ categoryId: category._id });
});
