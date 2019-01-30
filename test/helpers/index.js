/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const App = require('./App');

const should = chai.should();
chai.use(chaiHttp);

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const server = require('../../bin/www');

const API_URI = '/api/v1';

const User = require('../../models/user');

const USER_ARRAY = [
  {
    username: 'Bacon',
    profileName: 'BaconPname',
    email: 'bacon@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  },
  {
    username: 'tUser2',
    profileName: 'user2pname',
    email: 'user2@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  },
];

class TestCategory {
  constructor(name, parentId) {
    this.name = name;
    this.parent = parentId || null;
  }
}

const clearCollection = Model => Model.deleteMany({});

const dropDatabase = (done) => {
  const collections = Object.keys(mongoose.connection.collections);

  collections.forEach((collection) => {
    mongoose.connection.collections[collection].deleteMany(() => {});
  });
  done();
};

const copyAndFreeze = obj => Object.preventExtensions({ ...obj });

const reqLogin = (username, password) => requester
  .post(`${API_URI}/auth`)
  .send({ username, password });

const reqRegister = registerForm => requester
  .post(`${API_URI}/users`)
  .send(registerForm);

const requestUnregister = (userToken, password) => requester
  .delete(`${API_URI}/users/me`)
  .set('x-access-token', userToken)
  .send({ password });

const reqPostCategories = (token, category) => requester
  .post(`${API_URI}/categories`)
  .set('x-access-token', token)
  .send(category);

global.reqPostPosts = (userToken, post) => requester
  .post(`${API_URI}/posts`)
  .set('x-access-token', userToken)
  .send({ ...post });

class TestPost {
  constructor(post) {
    this.title = post.title;
    this.contents = post.contents;
    this.categoryId = post.categoryId || null;
    this._id = post._id || null;
  }
}

global.TestPost = TestPost;

class TestComment {
  constructor(comment) {
    this.contents = comment.contents;
    this.postId = comment.postId || null;
    this.parent = comment.parent || null;
    this._id = comment._id || null;
  }

  setId(id) {
    this._id = id;
  }
}
global.TestComment = TestComment;

global.reqPostComments = (userToken, comment) => requester
  .post(`${API_URI}/comments`)
  .set('x-access-token', userToken)
  .send({ ...comment });

const selectPostId = response => response.body.postId;
const selectCommentId = response => response.body.commentId;

const postTestPost = async ({ token, categoryId, postfix = '' }) => {
  const testPost = new TestPost({
    title: `test post title${postfix}`,
    contents: `test post contents${postfix}`,
    categoryId,
  });

  const res = await reqPostPosts(token, testPost);
  const postId = selectPostId(res);

  return postId;
};

const postTestComment = async ({
  token, postId, parentCommentId = null, postfix = '',
}) => {
  const testComment = new TestComment({
    contents: `test comment${postfix}`,
    postId,
    parent: parentCommentId,
  });

  const res = await reqPostComments(token, testComment);
  const commentId = selectCommentId(res);

  return commentId;
};

const reqGetComments = (query) => {
  const queryString = query || '';
  return requester
    .get(`${API_URI}/comments?${queryString}`);
};

const reqGetComment = commentId => requester.get(`${API_URI}/comments/${commentId}`);

global.chai = chai;
global.should = should;
global.assert = chai.assert;
global.server = server;
global.API_URI = API_URI;
global.clearCollection = clearCollection;
global.dropDatabase = dropDatabase;
global.copyAndFreeze = copyAndFreeze;
global.User = User;
global.USER_ARRAY = USER_ARRAY;
global.TestCategory = TestCategory;
global.reqLogin = reqLogin;
global.reqRegister = reqRegister;
global.requestUnregister = requestUnregister;
global.reqPostCategories = reqPostCategories;
global.ObjectId = ObjectId;
global.postTestPost = postTestPost;
global.postTestComment = postTestComment;
global.reqGetComments = reqGetComments;
global.reqGetComment = reqGetComment;

before(() => {
  App.open();
  // eslint-disable-next-line no-console
  console.log('<Server is kept open>');
});
after(() => {
  App.close();
  // eslint-disable-next-line no-console
  console.log('<Server is closed>');
});
