const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const { wrapAsync } = require('../../../util/util');
const Post = require('../../../models/post');
const User = require('../../../models/user');
const Category = require('../../../models/category');

const DEFAULT_LIMIT = 30;

const parseLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return parsed;
};

const isValidQueryParam = (query) => {
  const validQueryParams = ['category', 'limit', 'after', 'before'];
  let flag = true;
  Object.keys(query).forEach((param) => {
    if (!(validQueryParams.includes(param))) {
      flag = false;
    }
  });
  return flag;
};

const setRange = (before, after) => {
  if (!before && !after) {
    return undefined;
  }

  const range = {};

  if (before) {
    range.$lt = new ObjectId(before);
  }

  if (after) {
    range.$gt = new ObjectId(after);
  }

  return range;
};

const removeEmptyOption = (options) => {
  const cleanedOptions = { ...options };
  Object.keys(cleanedOptions).forEach((key) => {
    if (typeof cleanedOptions[key] === 'undefined') { delete cleanedOptions[key]; }
  });
  return cleanedOptions;
};

const buildNextPageUrl = (baseUrl, query, posts) => {
  const limit = parseLimit(query.limit);
  const limitParam = `?limit=${limit}`;

  if (posts.length < limit) {
    return '';
  }

  const category = query.category ? `&category=${query.category}` : '';

  const lastPost = posts[posts.length - 1];
  const before = `&before=${lastPost._id}`;

  return baseUrl + limitParam + category + before;
};


module.exports = wrapAsync(async (req, res) => {
  const { query } = req;

  if (!isValidQueryParam(query)) {
    res.status(400);
    return res.json('허용하지 않는 쿼리 파라메터 입니다.');
  }

  if (query.category && !ObjectId.isValid(query.category)) {
    res.status(400);
    return res.json('categoryId 형식이 잘못되었습니다.');
  }

  if (query.before && !ObjectId.isValid(query.before)) {
    res.status(400);
    return res.json({ message: 'before(id) 형식이 틀렸습니다.' });
  }

  if (query.after && !ObjectId.isValid(query.after)) {
    res.status(400);
    return res.json({ message: 'after(id)  형식이 틀렸습니다.' });
  }

  const matchOption = {
    category: query.category ? new ObjectId(query.category) : undefined,
    _id: setRange(query.before, query.after),
  };

  const cleanedMatchOption = removeEmptyOption(matchOption);

  const limit = parseLimit(query.limit);

  const posts = await Post.aggregate([
    {
      $match: cleanedMatchOption,
    },
    { $sort: { date: -1 } },
    { $limit: limit },
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

  const populatedPosts = await User.populate(posts, { path: 'author', select: 'profileName profilePic' });

  const results = await Category.populate(populatedPosts, { path: 'category', populate: { path: 'parent' } });

  const nextPageUrl = buildNextPageUrl(req.baseUrl, query, results);

  res.status(200);
  res.header('next-page-url', nextPageUrl);
  return res.json(results);
});
