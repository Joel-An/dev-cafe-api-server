const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync } = require('../../../util/util');
const Post = require('../../../models/post');
const User = require('../../../models/user');
const Category = require('../../../models/category');

const isValidQueryParam = (query, options) => {
  let flag = true;
  Object.keys(query).forEach((param) => {
    if (!(param in options)) {
      flag = false;
    }
  });
  return flag;
};

module.exports = wrapAsync(async (req, res) => {
  const { query } = req;

  if (query.category && !ObjectId.isValid(query.category)) {
    res.status(400);
    return res.json('categoryId 형식이 잘못되었습니다.');
  }

  const matchOption = query.category
    ? { category: new ObjectId(query.category) }
    : {};

  if (!isValidQueryParam(query, matchOption)) {
    res.status(400);
    return res.json('허용하지 않는 쿼리 파라메터 입니다.');
  }

  const posts = await Post.aggregate([
    {
      $match: matchOption,
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'post',
        as: 'comments',
      },
    },
    {
      $project: {
        commentsCount: { $size: '$comments' },
        comments: '$$REMOVE',
        title: 1,
        contents: 1,
        author: 1,
        category: 1,
        viewed: 1,
        upVotes: 1,
        date: 1,
      },
    },
  ]);

  if (posts.length === 0) {
    res.status(404);
    return res.json({ message: '글이 존재하지않습니다.' });
  }

  const populatedPosts = await User.populate(posts, { path: 'author', select: 'profileName' });

  const results = await Category.populate(populatedPosts, { path: 'category', populate: { path: 'parent' } });

  res.status(200);
  return res.json({ posts: results });
});
