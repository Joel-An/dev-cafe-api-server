const Post = require('../../../models/post');

module.exports = (req, res) => {
  Post.find({})
    .lean()
    .then(users => res.json(users))
    .catch((err) => {
      throw err;
    });
};
