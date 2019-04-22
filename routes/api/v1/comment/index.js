const commentRouter = require('express').Router();
const comments = require('../../../../controllers/comments');
const { isAuthenticated } = require('../../../../middleware/authenticator');
/*
 *      /api/v1/comments'
 */

commentRouter.get('/', comments.getComments);
commentRouter.get('/:id', comments.getCommentById);

commentRouter.post('/:id/heart', isAuthenticated, comments.giveHeart);
commentRouter.delete('/:id/heart', isAuthenticated, comments.takeHeartBack);

commentRouter.post('/:id/likes', isAuthenticated, comments.likeComment);
commentRouter.delete('/:id/likes', isAuthenticated, comments.deleteCommentLikes);

commentRouter.post('/:id/dislikes', isAuthenticated, comments.dislikeComment);
commentRouter.delete('/:id/dislikes', isAuthenticated, comments.deleteCommentDislikes);

commentRouter.post('/', isAuthenticated, comments.createComment);
commentRouter.delete('/:id', isAuthenticated, comments.deleteComment);
commentRouter.put('/:id', isAuthenticated, comments.updateComment);

module.exports = commentRouter;
