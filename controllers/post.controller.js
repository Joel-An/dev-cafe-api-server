const Post = require('../models/post');

exports.getPosts = (req, res) => {
  Post.find({})
    .lean()
    .then(users => res.json(users))
    .catch((err) => {
      throw err;
    });
};

exports.getPostById = (req, res) => {
  Post.findById(req.params.id)
    .lean()
    .then(user => res.json(user))
    .catch((err) => {
      throw err;
    });
};

exports.upvote = (req, res) => {
  Post.findByIdAndUpdate(req.params.id, { $inc: { upVotes: 1 } })
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      throw err;
    });
};

exports.downvote = (req, res) => {
  Post.findByIdAndUpdate(req.params.id, { $inc: { upVotes: -1 } })
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      throw err;
    });
};

exports.searchTitle = (req, res) => {
  const page = Number(req.query.page) || 0;
  const perPage = Number(req.query.perPage) || 5;

  Post.find({ title: { $regex: `(?i)${req.query.query}` } })
    .skip(page * perPage)
    .limit(perPage)
    .lean()
    .then((posts) => {
      const result = { hits: posts, page, total: posts.length };
      res.json(result);
    })
    .catch((err) => {
      throw err;
    });
};
