/**
 * @swagger
 *
 * paths:
 *   /users:
 *     delete:
 *       summary: 회원탈퇴
 *       tags:
 *         - users
 *       description: 회원탈퇴하며 작성한 모든 게시물과 댓글이 삭제됩니다.
 *       produces:
 *         - application/json
 *       parameters:
 *       - in: "body"
 *         name: "body"
 *         description: 비밀번호
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UnregisterForm'
 *       responses:
 *         204:
 *           description: 회원 탈퇴 성공
 *         400:
 *           description: 비밀번호 누락
 *         401:
 *           description: 인증되지 않은 사용자, 로그인 필요
 *         403:
 *           description: 비밀번호가 틀려 탈퇴가 거부됨
 * definitions:
 *   UnregisterForm:
 *     type: "object"
 *     properties:
 *       password:
 *         type: "string"
 */

const { wrapAsync, isEmptyInput } = require('../../../util/util');
const TokenManager = require('../../../util/token');
const User = require('../../../models/user');

module.exports = wrapAsync(async (req, res) => {
  const accessToken = req.get('x-access-token');
  const { password } = req.body;

  if (isEmptyInput(password)) {
    res.status(400);
    return res.json({ message: '회원탈퇴에는 비밀번호가 필요합니다.' });
  }

  const tokenManager = new TokenManager();

  const decoded = await tokenManager.decodeToken(accessToken).catch((err) => {
    // eslint-disable-next-line no-param-reassign
    err.message = '토큰이 유효하지 않습니다.';
    // eslint-disable-next-line no-param-reassign
    err.status = 401;
    throw err;
  });

  const user = await User.findById(decoded._id);

  if (!user) {
    res.status(404);
    return res.json({ message: '존재하지 않는 사용자입니다.' });
  }

  if (!user.validPassword(password)) {
    res.status(403);
    return res.json({ message: '비밀번호가 다릅니다.' });
  }

  await User.findByIdAndDelete(decoded._id);
  res.status(204);
  return res.end();
});
