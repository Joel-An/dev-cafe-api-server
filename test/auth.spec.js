'use strict';
describe('Auth', () => {
  const User = require('../models/user');
  let testUser1 = {
    userName: 'Bacon',
    profileName: 'BaconPname',
    email: 'bacon@gmail.com',
    password: '1q2w3e4r5t@',
    confirmPassword: '1q2w3e4r5t@',
  };

  describe('POST /auth', () => {
    before(done => {
      chai
        .request(server)
        .post(API_URI + '/users')
        .send(testUser1)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
    after(done => {
      clearCollection(User, done);
    });

    it('성공하면 response로 200 code와 엑세스 토큰을 받아야한다', done => {
      let loginForm = {
        userName: testUser1.userName,
        password: testUser1.password,
      };

      chai
        .request(server)
        .post(API_URI + '/auth')
        .send(loginForm)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('accessToken');
          done();
        });
    });
  });
});
