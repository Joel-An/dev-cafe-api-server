const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JwtSecretKey = require('../config/config').JwtSecretKey;

exports.getUsers = (req, res) => {
  User.find({})
    .lean()
    .then(users => {
      res.setHeader('Content-Type', 'application/json');
      return res.json(users);
    })
    .catch(err => {
      throw err;
    });
};

exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .lean()
    .then(user => {
      res.setHeader('Content-Type', 'application/json');
      return res.json(user);
    })
    .catch(err => {
      throw err;
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user.validPassword(req.body.password)) {
        throw new Error('Password is not valid');
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

        const result = { success: true, token: token };

        res.json(result);
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.register = (req, res, next) => {
  let user = new User();

  user.userName = req.body.userName;
  user.profileName = req.body.profileName;
  user.email = req.body.email;
  user.password = user.generateHash(req.body.password);

  User.create(user)
    .then(user => {
      res.status(201);
      res.json({ profileName: user.profileName });
    })
    .catch(err => {
      next(err);
    });
};
