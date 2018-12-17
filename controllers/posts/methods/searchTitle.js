const Post = require('../../../models/post');

module.exports = (req, res) => {
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
