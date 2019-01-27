const commentRouter = require('express').Router();
const comments = require('../../../../controllers/comments');
const { isAuthenticated } = require('../../../../middleware/authenticator');
/*
 *      /api/v1/comments'
 */

commentRouter.get('/', comments.getComments);
commentRouter.post('/', isAuthenticated, comments.createComment);
commentRouter.delete('/:id', isAuthenticated, comments.deleteComment);

module.exports = commentRouter;
