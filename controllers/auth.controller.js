const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JwtSecretKey } = require('../config/config');
const { AUTH_MESSAGE } = require('../constants/message');

const { wrapAsync } = require('../util/util');

exports.login = wrapAsync(async (req, res) => {
  if (!req.body.userName || !req.body.password) {
    res.status(403);
    return res.json({ message: AUTH_MESSAGE.ERROR.EMPTY_LOGINFORM });
  }

  const user = await User.findOne({ userName: req.body.userName });
  if (!user) {
    res.status(403);
    return res.json({ message: AUTH_MESSAGE.ERROR.WRONG_USERNAME });
  }

  if (!user.validPassword(req.body.password)) {
    res.status(403);
    return res.json({ message: AUTH_MESSAGE.ERROR.WRONG_PASSWORD });
  }

  const payload = {
    _id: user._id,
    email: user.email,
  };
  const secretOrPrivateKey = JwtSecretKey;
  const options = { expiresIn: 60 * 60 * 24 };

  jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
    if (err) {
      throw err;
    }

    const result = { accessToken: token };

    res.json(result);
  });
});
