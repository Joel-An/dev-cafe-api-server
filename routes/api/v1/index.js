const apiRouterV1 = require('express').Router();

const authRouter = require('./auth');
const commentRouter = require('./comment');
const userRouter = require('./user');
const postRouter = require('./post');
const categoryRouter = require('./category');

apiRouterV1.use('/auth', authRouter);
apiRouterV1.use('/comments', commentRouter);
apiRouterV1.use('/users', userRouter);
apiRouterV1.use('/posts', postRouter);
apiRouterV1.use('/categories', categoryRouter);

module.exports = apiRouterV1;
