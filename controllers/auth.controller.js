const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JwtSecretKey } = require('../config/config');
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

  const payload = {
    _id: user._id,
    email: user.email,
  };
  const secretOrPrivateKey = JwtSecretKey;
  const options = { expiresIn: 60 * 60 * 24 };

  const getToken = new Promise((resolve, reject) => {
    jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    });
  });

  const accessToken = await getToken;

  return res.json({ accessToken });
});
