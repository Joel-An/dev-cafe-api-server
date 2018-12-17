const { regex, wrapAsync, isEmptyInput } = require('../../../util/util');
const { USER_ERR } = require('../../../constants/message');
const User = require('../../../models/user');

const { userNameRule, passwordRule, emailRule } = regex;

module.exports = wrapAsync(async (req, res) => {
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
