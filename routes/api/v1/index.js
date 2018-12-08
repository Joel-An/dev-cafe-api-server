const router = require('express').Router();
const userController = require('../../../controllers/user.controller');
const postController = require('../../../controllers/post.controller');

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);

router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/search/posts', postController.searchTitle);

router.post('/upvote/posts/:id', postController.upvote);
router.post('/downvote/posts/:id', postController.downvote);

module.exports = router;
