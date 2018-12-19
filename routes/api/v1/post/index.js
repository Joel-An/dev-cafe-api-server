const postRouter = require('express').Router();
const posts = require('../../../../controllers/posts');
const { isAuthenticated } = require('../../../../middleware/authenticator');
/*
 *      /api/v1/posts'
 */
postRouter.get('/', posts.getPosts);
postRouter.get('/:id', posts.getPostById);
postRouter.get('/search', posts.searchTitle);

postRouter.post('/', isAuthenticated, posts.createPost);
postRouter.post('/:id/upvotes', posts.upvote);
postRouter.post('/:id/downvotes', posts.downvote);
module.exports = postRouter;
