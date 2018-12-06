const User = require("../models/user");

exports.getUsers = (req, res) => {
  User.find({})
    .lean()
    .then(users => {
      res.setHeader("Content-Type", "application/json");
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
      res.setHeader("Content-Type", "application/json");
      return res.json(user);
    })
    .catch(err => {
      throw err;
    });
};
