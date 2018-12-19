const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync } = require('../../../util/util');
const Category = require('../../../models/category');


module.exports = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    res.status(400);
    return res.json({ message: 'categoryId의 형식이 잘못되었습니다.' });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).end();
  }

  if (!category.isChild) {
    const child = await Category.findOne({ parentId: category._id });

    if (child) { return res.status(409).json({ message: '하위 카테고리가 존재합니다.' }); }
  }

  await Category.findByIdAndDelete(id);
  return res.status(204).end();
});
