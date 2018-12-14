process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

const server = require('../bin/www');

const API_URI = '/api/v1';

const User = require('../models/user');

const clearCollection = (Model, done) => {
  Model.deleteMany({}, (err) => {
    if (err) console.log(err);
    done();
  });
};

const copyAndFreeze = obj => Object.preventExtensions({ ...obj });

global.chai = chai;
global.should = should;
global.server = server;
global.API_URI = API_URI;
global.clearCollection = clearCollection;
global.copyAndFreeze = copyAndFreeze;
global.User = User;
