const { pipe, curry } = require('fxjs2');


const { wrapAsync } = require('../../../util/util');
const { populateNotification } = require('../../../util/notifier');

const User = require('../../../models/user');
const Notifications = require('../../../models/notification');

const findNotifications = (userId, notificationCheckDate) => Notifications
  .find({ userId, date: { $lte: notificationCheckDate } });

const limit = curry((count, query) => query.limit(count));

const sortByDate = curry((order, query) => query.sort({ date: order }));

const findOldNotifications = pipe(
  findNotifications,
  populateNotification,
  sortByDate('desc'),
  limit(20),
);

module.exports = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  const { notificationCheckDate } = user;

  const newNotifications = await findOldNotifications(userId, notificationCheckDate);

  if (newNotifications.length === 0) {
    return res.status(404).end();
  }


  res.status(200);
  return res.json(newNotifications);
});
