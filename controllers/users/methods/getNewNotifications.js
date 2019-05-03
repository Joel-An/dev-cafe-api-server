const { pipe, curry } = require('fxjs2');


const { wrapAsync } = require('../../../util/util');
const { userProjection } = require('../../../models/projectionFilters');

const User = require('../../../models/user');
const Notifications = require('../../../models/notification');

const findNotifications = (userId, notificationCheckDate) => Notifications
  .find({ userId, date: { $gte: notificationCheckDate } });

const populate = query => query.populate('post', 'title')
  .populate('comment', 'contents')
  .populate('childComment')
  .populate('fromWhom', userProjection);

const sortByDate = curry((order, query) => query.sort({ date: order }));

const findNewNotifications = pipe(
  findNotifications,
  populate,
  sortByDate('desc')
);

module.exports = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  const { notificationCheckDate } = user;

  const newNotifications = await findNewNotifications(userId, notificationCheckDate);

  if (newNotifications.length === 0) {
    return res.status(404).end();
  }


  res.status(200);
  return res.json(newNotifications);
});
