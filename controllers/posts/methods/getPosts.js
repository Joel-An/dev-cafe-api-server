const { wrapAsync } = require('../../../util/util');
const Post = require('../../../models/post');
const User = require('../../../models/user');
const Category = require('../../../models/category');

module.exports = wrapAsync(async (req, res) => {
  const posts = await Post.aggregate([
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
