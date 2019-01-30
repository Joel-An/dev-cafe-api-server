/* eslint-disable no-undef */
const { curry } = require('fxjs2');

const App = require('./App');

const postPost = async (userToken, post) => {
  const res = await App.reqPostPost(userToken, post);
  const id = res.body.postId;
  post.setId(id);

  return post;
};

const createPostInto = (category, num = 0) => {
  const post = new TestPost({
    title: `test post${num} in ${category.name} category`,
    contents: `test post${num}`,
    categoryId: category._id,
  });

  return post;
};

const postComment = async (userToken, comment) => {
  const res = await App.reqPostComment(userToken, comment);
  const id = res.body.commentId;
  comment.setId(id);

  return comment;
};

const createCommentInto = (post, num = 0) => {
  const comment = new TestComment({
    contents: `test comment${num} in post ${post.title}`,
    postId: post._id,
  });

  return comment;
};

const createChildCommentOf = (comment, num = 0) => {
  const childComment = new TestComment({
    contents: `${comment.contents}'s child comment${num}`,
    postId: comment.postId,
    parent: comment._id,
  });

  return childComment;
};


const TestDataHelper = {
  postPost: curry(postPost),
  createPostInto: curry(createPostInto),
  postComment: curry(postComment),
  createCommentInto: curry(createCommentInto),
  createChildCommentOf: curry(createChildCommentOf),
};


module.exports = TestDataHelper;
