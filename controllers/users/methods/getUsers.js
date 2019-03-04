const User = require('../../../models/user');

module.exports = (req, res) => {
  User.find({}, '-password -email')
    .lean()
    .then((users) => {
      res.setHeader('Content-Type', 'application/json');
      return res.json(users);
    })
    .catch((err) => {
      throw err;
    });
};
