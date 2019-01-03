const { wrapAsync, listToTree } = require('../../../util/util');
const Category = require('../../../models/category');


module.exports = wrapAsync(async (req, res) => {
  const results = await Category.find({}, null, { sort: { isChild: 1 } })
    .lean();

  if (results.length === 0) {
    return res.status(404).end();
  }

  const categories = listToTree(results);
  res.status(200);
  return res.json(categories);
});
