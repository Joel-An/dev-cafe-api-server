const commentRouter = require('express').Router();
const comments = require('../../../../controllers/comments');
/*
 *      /api/v1/comments'
 */

commentRouter.get('/', comments.getComments);

module.exports = commentRouter;
