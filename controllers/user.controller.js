const TokenManager = require('../util/token');
const User = require('../models/user');
const { wrapAsync, isEmptyInput, regex } = require('../util/util');

const { userNameRule, passwordRule, emailRule } = regex;
const { USER_ERR } = require('../constants/message');

exports.getUsers = (req, res) => {
  User.find({})
    .lean()
    .then((users) => {
      res.setHeader('Content-Type', 'application/json');
      return res.json(users);
    })
    .catch((err) => {
      throw err;
    });
};

exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .lean()
    .then((user) => {
      res.setHeader('Content-Type', 'application/json');
      return res.json(user);
    })
    .catch((err) => {
      throw err;
    });
};

exports.register = wrapAsync(async (req, res) => {
  const {
    userName, profileName, email, password, confirmPassword,
  } = {
    ...req.body,
  };

  if (isEmptyInput(userName, profileName, email, password, confirmPassword)) {
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

  if (!userNameRule.test(userName)) {
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
    $or: [{ userName }, { email }],
  });

  if (oldUser) {
    res.status(403);
    return res.json({
      message: USER_ERR.DUPLICATED_USERINFO,
    });
  }

  const user = new User();

  user.userName = userName;
  user.profileName = profileName;
  user.email = email;
  user.password = user.generateHash(password);

  await user.save();

  res.status(201);
  return res.json({ profileName: user.profileName, email: user.email });
});

exports.unregister = wrapAsync(async (req, res) => {
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
