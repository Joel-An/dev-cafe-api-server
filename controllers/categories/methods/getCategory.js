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

  res.status(200);
  return res.json({ category });
});
