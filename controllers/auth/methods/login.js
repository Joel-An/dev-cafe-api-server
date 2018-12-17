/**
 * @swagger
 *
 * paths:
 *   /auth:
 *     post:
 *       summary: 로그인
 *       tags:
 *         - auth
 *       description: 로그인하여 회원용 서비스 이용에 필요한 토큰을 받습니다.
 *       produces:
 *         - application/json
 *       parameters:
 *       - in: "body"
 *         name: "body"
 *         description: 사용자 이름, 비밀번호
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LoginForm'
 *       responses:
 *         201:
 *           description: 로그인 성공
 *           schema:
 *             $ref: '#/definitions/LoginResult'
 *         400:
 *           description: 사용자 이름,비밀번호 누락 or 잘못된 형식
 *         403:
 *           description: 존재하지 않는 사용자 or 틀린 비밀번호
 * definitions:
 *   LoginForm:
 *     type: "object"
 *     properties:
 *       username:
 *         type: "string"
 *       description: 사용자 이름 or 이메일 주소
 *       password:
 *         type: "string"
 *   LoginResult:
 *     type: "object"
 *     properties:
 *       accessToken:
 *         type: "string"
 *         description: 로그인이 필요한 서비스 이용시 제출하는 토큰
 */

const TokenManager = require('../../../util/token');
const User = require('../../../models/user');
const { AUTH_ERR } = require('../../../constants/message');

const { wrapAsync, isEmptyInput } = require('../../../util/util');

module.exports = wrapAsync(async (req, res) => {
  const { userName, password } = req.body;

  if (isEmptyInput(userName, password)) {
    res.status(400);
    return res.json({ message: AUTH_ERR.EMPTY_LOGINFORM });
  }

  const user = await User.findOne({ userName });
  if (!user) {
    res.status(403);
    return res.json({ message: AUTH_ERR.WRONG_USERNAME });
  }

  if (!user.validPassword(password)) {
    res.status(403);
    return res.json({ message: AUTH_ERR.WRONG_PASSWORD });
  }

  const tokenManager = new TokenManager();
  const accessToken = await tokenManager.signToken(user._id, user.email);

  res.status(201);
  return res.json({ accessToken });
});
