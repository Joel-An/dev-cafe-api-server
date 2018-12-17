process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

const server = require('../bin/www');

const API_URI = '/api/v1';

const User = require('../models/user');

const USER_ARRAY = [
  {
    userName: 'Bacon',
    profileName: 'BaconPname',
    email: 'bacon@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  },
  {
    userName: 'tUser2',
    profileName: 'user2pname',
    email: 'user2@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  },
];

const clearCollection = (Model, done) => {
  Model.deleteMany({}, (err) => {
    if (err) console.error(err);
    done();
  });
};

const copyAndFreeze = obj => Object.preventExtensions({ ...obj });

const reqLogin = (userName, password) => chai
  .request(server)
  .post(`${API_URI}/auth`)
  .send({ userName, password });

const reqRegister = registerForm => chai
  .request(server)
  .post(`${API_URI}/users`)
  .send(registerForm);


global.chai = chai;
global.should = should;
global.server = server;
global.API_URI = API_URI;
global.clearCollection = clearCollection;
global.copyAndFreeze = copyAndFreeze;
global.User = User;
global.USER_ARRAY = USER_ARRAY;
global.reqLogin = reqLogin;
global.reqRegister = reqRegister;
