/**
 * @swagger
 *
 * /auth:
 *   post:
 *     summary: Login
 *     tags:
 *       - AUTH
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userName
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
const apiRouterV1 = require('express').Router();

const authRouter = require('./auth');
const commentRouter = require('./comment');
const userRouter = require('./user');
const postRouter = require('./post');

apiRouterV1.use('/auth', authRouter);
apiRouterV1.use('/comments', commentRouter);
apiRouterV1.use('/users', userRouter);
apiRouterV1.use('/posts', postRouter);

module.exports = apiRouterV1;
