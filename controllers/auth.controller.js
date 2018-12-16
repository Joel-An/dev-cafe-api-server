const TokenManager = require('../util/token');
const User = require('../models/user');
const { AUTH_ERR } = require('../constants/message');

const { wrapAsync, isEmptyInput } = require('../util/util');

exports.login = wrapAsync(async (req, res) => {
  const { userName, password } = req.body;

  if (isEmptyInput(userName, password)) {
    res.status(403);
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
  const getToken = tokenManager.signToken(user._id, user.email);

  const accessToken = await getToken;

  return res.json({ accessToken });
});
