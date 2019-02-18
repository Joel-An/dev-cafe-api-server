const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');

const DEFAULT_LIMIT = 30;

const isValidQueryParam = (query) => {
  const validQueryParams = ['post', 'limit', 'after', 'before'];
  let flag = true;
  Object.keys(query).forEach((param) => {
    if (!(validQueryParams.includes(param))) {
      flag = false;
    }
  });
  return flag;
};

const removeEmptyOption = (options) => {
  const cleanedOptions = { ...options };
  Object.keys(cleanedOptions).forEach((key) => {
    if (typeof cleanedOptions[key] === 'undefined') { delete cleanedOptions[key]; }
  });
  return cleanedOptions;
};

const parseLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return parsed;
};

const setRange = (before, after) => {
  if (!before && !after) {
    return undefined;
  }

  const range = {};

  if (before) {
    range.$lt = before;
  }

  if (after) {
    range.$gt = after;
  }

  return range;
};

const buildNextPageUrl = (baseUrl, query, comments) => {
  const limit = parseLimit(query.limit);
  const limitParam = `?limit=${limit}`;

  if (comments.length < limit) {
    return '';
  }

  const post = query.post ? `&post=${query.post}` : '';

  const lastComment = comments[comments.length - 1];
  const after = `&after=${lastComment._id}`;

  return baseUrl + limitParam + post + after;
};

module.exports = wrapAsync(async (req, res) => {
  const { query } = req;
  const options = {
    post: query.post,
    isChild: query.post ? false : undefined,
    _id: setRange(query.before, query.after),
  };
  const limit = parseLimit(query.limit);

  if (!isValidQueryParam(query)) {
    res.status(400);
    return res.json({ message: '허용하지않는 쿼리 파라메터입니다.' });
  }

  if (query.before && !ObjectId.isValid(query.before)) {
    res.status(400);
    return res.json({ message: 'before(id) 형식이 틀렸습니다.' });
  }

  if (query.after && !ObjectId.isValid(query.after)) {
    res.status(400);
    return res.json({ message: 'after(id)  형식이 틀렸습니다.' });
  }

  if (options.post && !ObjectId.isValid(options.post)) {
    res.status(400);
    return res.json({ message: 'postId 형식이 틀렸습니다.' });
  }

  const cleanedOptions = removeEmptyOption(options);

  const comments = await Comment
    .find(cleanedOptions, null)
    .populate('author', 'profileName')
    .populate({
      path: 'childComments',
      populate: {
        path: 'author',
        model: 'User',
        select: 'profileName',
      },
    })
    .limit(limit)
    .sort({ date: 'asc' })
    .lean();

  if (comments.length === 0) {
    return res.status(404).end();
  }

  const nextPageUrl = buildNextPageUrl(req.baseUrl, query, comments);

  res.status(200);
  res.header('next-page-url', nextPageUrl);
  return res.json(comments);
});
