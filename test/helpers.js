process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const server = require('../bin/www');

global.chai = chai;
global.should = should;
global.server = server;
