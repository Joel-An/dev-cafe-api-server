const Post = require('../../../models/post');

module.exports = (req, res) => {
  Post.findByIdAndUpdate(req.params.id, { $inc: { upVotes: 1 } })
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      throw err;
    });
};
