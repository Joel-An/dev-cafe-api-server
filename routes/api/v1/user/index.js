const userRouter = require('express').Router();
const userController = require('../../../../controllers/user.controller');
/*
 *      /api/v1/users'
 */
userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.register);

userRouter.get('/:id', userController.getUserById);

userRouter.delete('/me', userController.unregister);
module.exports = userRouter;
