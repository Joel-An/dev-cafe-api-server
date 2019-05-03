const userRouter = require('express').Router();
const users = require('../../../../controllers/users');
const { isAuthenticated } = require('../../../../middleware/authenticator');
/*
 *      /api/v1/users'
 */
userRouter.get('/', users.getUsers);
userRouter.post('/', users.register);

userRouter.get('/me', isAuthenticated, users.getMyInfo);
userRouter.get('/me/new-notifications', isAuthenticated, users.getNewNotifications);
userRouter.get('/me/old-notifications', isAuthenticated, users.getOldNotifications);
userRouter.put('/me/notification-check-date', isAuthenticated, users.putNotificationCheckDate);
userRouter.get('/me/notification-check-date', isAuthenticated, users.getNotificationCheckDate);
userRouter.get('/:id', users.getUserById);

userRouter.delete('/me', isAuthenticated, users.unRegister);
module.exports = userRouter;
