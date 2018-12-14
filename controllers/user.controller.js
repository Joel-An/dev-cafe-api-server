const User = require('../models/user');
const wrapAsync = require('../util/util').wrapAsync;
const USER_MESSAGE = require('../constants/message').USER;

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
  const userName = req.body.userName;
  const profileName = req.body.profileName;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!userName || !profileName || !email || !password || !confirmPassword) {
    res.status(403);
    return res.json({ message: USER_MESSAGE.ERROR.EMPTY_USERINFO });
  }

  if (password !== confirmPassword) {
    res.status(403);
    return res.json({ message: USER_MESSAGE.ERROR.WRONG_COMFIRM_PASSWORD });
  }

  if (profileName.length > 20) {
    res.status(403);
    return res.json({
      message: USER_MESSAGE.ERROR.INVALID_PROFILENAME,
    });
  }

  const userNameRule = /^[a-zA-Z0-9-]{2,20}$/;
  if (!userNameRule.test(userName)) {
    res.status(403);
    return res.json({
      message: USER_MESSAGE.ERROR.INVALID_USERNAME,
    });
  }

  const regex = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$\*%^&+=]).*$/;

  if (!regex.test(password)) {
    res.status(403);
    return res.json({
      message: USER_MESSAGE.ERROR.INVALID_PASSWORD,
    });
  }

  const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

  if (!emailRule.test(email)) {
    res.status(403);
    return res.json({
      message: USER_MESSAGE.ERROR.INVALID_EMAIL,
    });
  }

  const oldUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (oldUser) {
    res.status(403);
    return res.json({
      message: USER_MESSAGE.ERROR.DUPLICATED_USERINFO,
    });
  }

  const user = new User();

  user.userName = userName;
  user.profileName = profileName;
  user.email = email;
  user.password = user.generateHash(password);

  await User.create(user).then((user) => {
    res.status(201);
    res.json({ profileName: user.profileName, email: user.email });
  });
});
