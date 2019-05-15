/**
 * @swagger
 *
 * tags:
 * - name: "auth"
 *   description: "사용자 인증 기능을 제공합니다."
*/

exports.login = require('./methods/login');
exports.logout = require('./methods/logout');
exports.testerLogin = require('./methods/testerLogin');
exports.githubLogin = require('./methods/githubLogin');
