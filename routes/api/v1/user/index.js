const userRouter = require('express').Router();
const userController = require('../../../../controllers/user.controller');
const { isAuthenticated } = require('../../../../middleware/authenticator');
/*
 *      /api/v1/users'
 */
userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.register);

userRouter.get('/:id', userController.getUserById);

userRouter.delete('/me', isAuthenticated, userController.unregister);
module.exports = userRouter;
