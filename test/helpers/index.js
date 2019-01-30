/* eslint-disable no-undef */
const chai = require('chai');

const should = chai.should();

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const App = require('./App');

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

const selectPostId = response => response.body.postId;
const selectCommentId = response => response.body.commentId;

const postTestPost = async ({ token, categoryId, postfix = '' }) => {
  const testPost = new TestPost({
    title: `test post title${postfix}`,
    contents: `test post contents${postfix}`,
    categoryId,
  });

  const res = await App.reqPostPost(token, testPost);
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

  const res = await App.reqPostComment(token, testComment);
  const commentId = selectCommentId(res);

  return commentId;
};

global.chai = chai;
global.should = should;
global.assert = chai.assert;
global.clearCollection = clearCollection;
global.dropDatabase = dropDatabase;
global.copyAndFreeze = copyAndFreeze;
global.USER_ARRAY = USER_ARRAY;
global.TestCategory = TestCategory;
global.ObjectId = ObjectId;
global.postTestPost = postTestPost;
global.postTestComment = postTestComment;

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
