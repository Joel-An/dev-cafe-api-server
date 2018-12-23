/**
 * @swagger
 *
 * tags:
 * - name: "users"
 *   description: "사용자 정보를 조회/관리 관리합니다."
*/

exports.register = require('./methods/register');
exports.unRegister = require('./methods/unRegister');

exports.getUsers = require('./methods/getUsers');
exports.getUserById = require('./methods/getUserById');
exports.getMyInfo = require('./methods/getMyInfo');
