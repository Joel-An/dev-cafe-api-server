/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const server = require('../bin/www');

const API_URI = '/api/v1';

const User = require('../models/user');

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

const clearCollection = (Model, done) => {
  Model.deleteMany({}, (err) => {
    if (err) console.error(err);
    done();
  });
};

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
  }
}

global.TestPost = TestPost;

class TestComment {
  constructor(comment) {
    this.contents = comment.contents;
    this.postId = comment.postId || null;
    this.parent = comment.parent || null;
  }
}
global.TestComment = TestComment;

global.reqPostComments = (userToken, comment) => requester
  .post(`${API_URI}/comments`)
  .set('x-access-token', userToken)
  .send({ ...comment });


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
global.reqPostCategories = reqPostCategories;
global.ObjectId = ObjectId;


before(() => {
  global.requester = chai.request(server).keepOpen();
  // eslint-disable-next-line no-console
  console.log('<Server is kept open>');
});
after(() => {
  requester.close();
  // eslint-disable-next-line no-console
  console.log('<Server is closed>');
});
