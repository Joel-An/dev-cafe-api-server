const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JwtSecretKey = require('../config/config').JwtSecretKey;

const wrapAsync = require('../util/util').wrapAsync;

exports.login = wrapAsync(async (req, res) => {
  User.findOne({ userName: req.body.userName }).then(user => {
    if (!user) {
      res.status(403);
      return res.json({ message: '아이디/비밀번호가 일치하지 않습니다.' });
    }

    if (!user.validPassword(req.body.password)) {
      res.status(403);
      return res.json({ message: '비밀번호가 일치하지 않습니다.' });
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
});
