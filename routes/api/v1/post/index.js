const postRouter = require('express').Router();
const postController = require('../../../../controllers/post.controller');
/*
 *      /api/v1/posts'
 */
postRouter.get('/', postController.getPosts);
postRouter.get('/:id', postController.getPostById);
postRouter.get('/search', postController.searchTitle);

postRouter.post('/:id/upvotes', postController.upvote);
postRouter.post('/:id/downvotes', postController.downvote);
module.exports = postRouter;
