/* eslint-disable no-undef */

// Assertions
const chai = require('chai');

const should = chai.should();
const { assert } = chai;

global.should = should;
global.assert = assert;

// DB
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const clearCollection = Model => Model.deleteMany({});

const dropDatabase = (done) => {
  const collections = Object.keys(mongoose.connection.collections);

  collections.forEach((collection) => {
    mongoose.connection.collections[collection].deleteMany(() => {});
  });
  done();
};

global.ObjectId = ObjectId;
global.clearCollection = clearCollection;
global.dropDatabase = dropDatabase;

// 테스트용 서버
const App = require('./App');

// 테스트용 데이터
const copyAndFreeze = obj => Object.preventExtensions({ ...obj });

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
  {
    username: 'tUser3',
    profileName: 'user3pname',
    email: 'user3@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  },
];

class TestData {
  constructor(id) {
    this._id = id || null;
  }

  setId(id) {
    this._id = id;
  }
}

class TestCategory extends TestData {
  constructor(name, parentId, id) {
    super(id);
    this.name = name;
    this.parent = parentId || null;
  }

  setParent(parentId) {
    this.parent = parentId;
  }
}

class TestPost extends TestData {
  constructor(post) {
    super(post._id);
    this.title = post.title;
    this.contents = post.contents;
    this.categoryId = post.categoryId || null;
  }
}


class TestComment extends TestData {
  constructor(comment) {
    super(comment._id);
    this.contents = comment.contents;
    this.postId = comment.postId || null;
    this.parent = comment.parent || null;
  }
}

global.copyAndFreeze = copyAndFreeze;
global.USER_ARRAY = USER_ARRAY;
global.TestCategory = TestCategory;
global.TestPost = TestPost;
global.TestComment = TestComment;


// 테스트 데이터 builder

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

global.postTestPost = postTestPost;
global.postTestComment = postTestComment;


// 전체 테스트 전,후로 서버 open
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
