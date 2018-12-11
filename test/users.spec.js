const User = require('../models/user');

describe('Users', () => {
  describe('POST /users (회원가입)', () => {
    describe('회원가입에 성공하면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      const testUser = {
        userName: 'chris.P.bacon',
        profileName: 'chris',
        email: 'cpb@gmail.com',
        password: '123',
        confirmPassword: '123',
      };

      it('response로 201 status, profileName, email을 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(testUser)
          .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.have.property('profileName', testUser.profileName);
            done();
          });
      });

      it('DB에 회원정보가 저장되어 있어야한다', done => {
        User.findOne({ userName: testUser.userName }, (err, user) => {
          should.exist(user);
          should.not.exist(err);
          user.should.have.property('userName', user.userName);
          user.should.have.property('profileName', user.profileName);
          user.should.have.property('email', user.email);
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
