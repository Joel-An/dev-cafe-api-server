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
exports.giveHeart = require('./methods/giveHeart');
exports.takeHeartBack = require('./methods/takeHeartBack');

exports.likeComment = require('./methods/likeComment');
exports.deleteCommentLikes = require('./methods/deleteCommentLikes');

exports.dislikeComment = require('./methods/dislikeComment');
exports.deleteCommentDislikes = require('./methods/deleteCommentDislikes');
