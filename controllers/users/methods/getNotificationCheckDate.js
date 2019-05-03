const { wrapAsync } = require('../../../util/util');

const User = require('../../../models/user');

module.exports = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  const { notificationCheckDate } = user;

  res.status(201);
  return res.json({ notificationCheckDate });
});
