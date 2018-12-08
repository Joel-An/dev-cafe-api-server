const Post = require('../models/post');

exports.getPosts = (req, res) => {
  Post.find({})
    .lean()
    .then(users => {
      return res.json(users);
    })
    .catch(err => {
      throw err;
    });
};

exports.getPostById = (req, res) => {
  Post.findById(req.params.id)
    .lean()
    .then(user => {
      return res.json(user);
    })
    .catch(err => {
      throw err;
    });
};

exports.upvote = (req, res) => {
  Post.findByIdAndUpdate(req.params.id, { $inc: { upVotes: 1 } })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      throw err;
    });
};

exports.downvote = (req, res) => {
  Post.findByIdAndUpdate(req.params.id, { $inc: { upVotes: -1 } })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      throw err;
    });
};
