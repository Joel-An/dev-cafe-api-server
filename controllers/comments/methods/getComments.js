const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { wrapAsync } = require('../../../util/util');
const Comment = require('../../../models/comment');

const isValidQueryParam = (query) => {
  const validQueryParams = ['post', 'limit'];
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

module.exports = wrapAsync(async (req, res) => {
  const { query } = req;
  const options = {
    post: query.post,
    isChild: query.post ? false : undefined,
  };
  const limit = query.limit ? Number.parseInt(query.limit, 10) : 0;

  if (!isValidQueryParam(query)) {
    res.status(400);
    return res.json({ message: '허용하지않는 쿼리 파라메터입니다.' });
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
    .sort('-date')
    .lean();

  if (comments.length === 0) {
    return res.status(404).end();
  }

  res.status(200);
  return res.json(comments);
});
