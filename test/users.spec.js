const User = require('../models/user');

describe('Users', () => {
  describe('POST /users (회원가입)', () => {
    beforeEach(done => {
      clearCollection(User, done);
    });

    describe('성공하면', () => {
      it('profile name을 받아온다.', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send({
            userName: 'userName',
            profileName: 'profileName',
            email: 'email@gmail.com',
            password: '123',
            confirmPassword: '123',
          })
          .end((err, res) => {
            res.should.have.status(201);
            res.shoud.be.json;
            res.body.should.have.property(profileName, 'profileName');
            done();
          });
      });
    });

    describe.skip('실패하면', () => {
      it(' message를 받아온다.', done => {
        done();
      });
    });
  });

  describe.skip('GET /users', () => {
    it('it should GET all users', done => {
      chai
        .request(server)
        .get(API_URI + '/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.length.should.not.be.equal(0);

          done();
        });
    });
  });
});
