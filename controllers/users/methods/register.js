/**
 * @swagger
 *
 * paths:
 *   /users:
 *     post:
 *       summary: 회원가입
 *       tags:
 *         - users
 *       description: 서비스에 회원으로 가입합니다.
 *       produces:
 *         - application/json
 *       parameters:
 *       - in: "body"
 *         name: "body"
 *         description: 회원가입에 필요한 사용자 정보
 *         required: true
 *         schema:
 *           $ref: '#/definitions/RegisterForm'
 *       responses:
 *         201:
 *           description: 회원 가입 성공
 *           schema:
 *             $ref: '#/definitions/RegisterResult'
 *         400:
 *           description: 사용자 정보 누락 or 잘못된 형식
 *         409:
 *           description: 이미 존재하는 유저
 * definitions:
 *   RegisterForm:
 *     type: "object"
 *     properties:
 *       username:
 *         type: "string"
 *         description: 사용자 이름 (ID)
 *       profileName:
 *         type: "string"
 *         description: 닉네임
 *       email:
 *         type: "string"
 *         description: 이메일 주소
 *       password:
 *         type: "string"
 *         description: 비밀번호
 *       confirmPassword:
 *         type: "string"
 *         description: 비밀번호 확인
 *   RegisterResult:
 *     type: "object"
 *     properties:
 *       username:
 *         type: "string"
 *         description: 사용자 이름 (ID)
 *       profileName:
 *         type: "string"
 *         description: 닉네임
 */
const { regex, wrapAsync, isEmptyInput } = require('../../../util/util');
const { USER_ERR } = require('../../../constants/message');
const User = require('../../../models/user');

const { usernameRule, passwordRule, emailRule } = regex;

module.exports = wrapAsync(async (req, res) => {
  const {
    username, profileName, email, password, confirmPassword,
  } = {
    ...req.body,
  };

  if (isEmptyInput(username, profileName, email, password, confirmPassword)) {
    res.status(403);
    return res.json({ message: USER_ERR.EMPTY_USERINFO });
  }

  if (password !== confirmPassword) {
    res.status(403);
    return res.json({ message: USER_ERR.WRONG_COMFIRM_PASSWORD });
  }

  if (profileName.length > 20) {
    res.status(403);
    return res.json({
      message: USER_ERR.INVALID_PROFILENAME,
    });
  }

  if (!usernameRule.test(username)) {
    res.status(403);
    return res.json({
      message: USER_ERR.INVALID_USERNAME,
    });
  }

  if (!passwordRule.test(password)) {
    res.status(403);
    return res.json({
      message: USER_ERR.INVALID_PASSWORD,
    });
  }

  if (!emailRule.test(email)) {
    res.status(403);
    return res.json({
      message: USER_ERR.INVALID_EMAIL,
    });
  }

  const oldUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (oldUser) {
    res.status(403);
    return res.json({
      message: USER_ERR.DUPLICATED_USERINFO,
    });
  }

  const user = new User();

  user.username = username;
  user.profileName = profileName;
  user.email = email;
  user.password = user.generateHash(password);

  const users = await User.find({});
  if (users.length === 0) {
    user.isAdmin = true;
  }

  await user.save();

  res.status(201);
  return res.json({ profileName: user.profileName, email: user.email });
});
