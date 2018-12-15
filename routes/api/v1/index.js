const router = require('express').Router();
const userController = require('../../../controllers/user.controller');
const postController = require('../../../controllers/post.controller');
const authController = require('../../../controllers/auth.controller');

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);

router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/search/posts', postController.searchTitle);

router.post('/upvote/posts/:id', postController.upvote);
router.post('/downvote/posts/:id', postController.downvote);

router.post('/auth', authController.login);
router.post('/users', userController.register);

router.delete('/users/me', userController.unregister);

module.exports = router;
