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
    this.parentId = parentId || null;
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

const reqLogin = (username, password) => chai
  .request(server)
  .post(`${API_URI}/auth`)
  .send({ username, password });

const reqRegister = registerForm => chai
  .request(server)
  .post(`${API_URI}/users`)
  .send(registerForm);

const reqPostCategories = category => chai
  .request(server)
  .post(`${API_URI}/categories`)
  .send(category);


global.chai = chai;
global.should = should;
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
