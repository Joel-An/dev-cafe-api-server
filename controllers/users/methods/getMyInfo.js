const { wrapAsync } = require('../../../util/util');
const User = require('../../../models/user');
const { userProjection } = require('../../../models/projectionFilters');

module.exports = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const myInfo = await User.findById(userId).select(userProjection);

  res.status(200).json({ myInfo });
});
