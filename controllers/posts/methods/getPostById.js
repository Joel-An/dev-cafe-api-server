const Post = require('../../../models/post');

module.exports = (req, res) => {
  Post.findById(req.params.id)
    .lean()
    .then(user => res.json(user))
    .catch((err) => {
      throw err;
    });
};
