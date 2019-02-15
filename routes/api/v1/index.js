const apiRouterV1 = require('express').Router();

const authRouter = require('./auth');
const commentRouter = require('./comment');
const userRouter = require('./user');
const postRouter = require('./post');
const categoryRouter = require('./category');
const imageRounter = require('./images');

const { deserializer } = require('../../../middleware/authenticator');

apiRouterV1.use(deserializer);
apiRouterV1.use('/auth', authRouter);
apiRouterV1.use('/comments', commentRouter);
apiRouterV1.use('/users', userRouter);
apiRouterV1.use('/posts', postRouter);
apiRouterV1.use('/categories', categoryRouter);
apiRouterV1.use('/images', imageRounter);

module.exports = apiRouterV1;
