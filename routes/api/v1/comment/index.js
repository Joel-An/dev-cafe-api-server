const commentRouter = require('express').Router();
const commentController = require('../../../../controllers/comment.controller');
/*
 *      /api/v1/comments'
 */

commentRouter.get('/', commentController.getComments);

module.exports = commentRouter;
