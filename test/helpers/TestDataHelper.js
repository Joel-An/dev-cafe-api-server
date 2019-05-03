/* eslint-disable no-undef */
const { curry, pipe } = require('fxjs2');

const App = require('./App');

const register = async (user) => {
  await App.reqRegister(user);
  return user;
};

const login = async (user) => {
  const res = await App.reqLogin(user.username, user.password);
  token = res.body.accessToken;

  return token;
};

const registerAndLogin = pipe(register, login);

const createCategory = (name) => {
  const category = new TestCategory(name);
  return category;
};

const createChildCategory = (name, parentCategory) => {
  const childCategory = createCategory(name);

  childCategory.setParent(parentCategory._id);
  return childCategory;
};

const postCategory = async (userToken, category) => {
  const res = await App.reqPostCategory(userToken, category);
  const id = res.body.categoryId;
  category.setId(id);

  return category;
};

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

const deletePost = async (userToken, post) => {
  await App.reqDeletePost(userToken, post._id);
};


const TestDataHelper = {
  registerAndLogin,
  createCategory,
  createChildCategory: curry(createChildCategory),
  postCategory: curry(postCategory),
  postPost: curry(postPost),
  createPostInto: curry(createPostInto),
  postComment: curry(postComment),
  createCommentInto: curry(createCommentInto),
  createChildCommentOf: curry(createChildCommentOf),
  deletePost: curry(deletePost),
};


module.exports = TestDataHelper;
