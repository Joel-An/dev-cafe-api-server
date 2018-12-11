process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const server = require('../bin/www');

const API_URI = '/api/v1';

global.chai = chai;
global.should = should;
global.server = server;
global.API_URI = API_URI;
