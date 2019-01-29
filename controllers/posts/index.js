/**
 * @swagger
 *
 * tags:
 * - name: "posts"
 *   description: "게시물을 조회/관리합니다."
*/

exports.downvote = require('./methods/downvote');
exports.upvote = require('./methods/upvote');

exports.getPosts = require('./methods/getPosts');
exports.getPostById = require('./methods/getPostById');

exports.searchTitle = require('./methods/searchTitle');
exports.createPost = require('./methods/createPost');

exports.deletePost = require('./methods/deletePost');
