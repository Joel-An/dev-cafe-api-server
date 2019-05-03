const { wrapAsync } = require('../../../util/util');

const User = require('../../../models/user');
const Socket = require('../../../util/Socket');

module.exports = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(userId, {
    $set: {
      notificationCheckDate: Date.now(),
    },
  }, { new: true }).lean();

  Socket.emitPostNotifCheckTime(userId, user.notificationCheckDate);

  res.status(201);
  return res.json({ notificationCheckDate: user.notificationCheckDate });
});
