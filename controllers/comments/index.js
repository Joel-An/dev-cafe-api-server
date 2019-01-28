/**
 * @swagger
 *
 * tags:
 * - name: "comments"
 *   description: "댓글을 조회/관리합니다."
*/

exports.getComments = require('./methods/getComments');
exports.getCommentById = require('./methods/getCommentById');
exports.createComment = require('./methods/createComment');
exports.deleteComment = require('./methods/deleteComment');
exports.updateComment = require('./methods/updateComment');
