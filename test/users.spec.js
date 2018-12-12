'use strict';

const User = require('../models/user');
const USER_MESSAGE = require('../constants/message').USER;

const testUser1 = {
  userName: 'Bacon',
  profileName: 'BaconPname',
  email: 'bacon@gmail.com',
  password: '1q2w3e4r5t@',
  confirmPassword: '1q2w3e4r5t@',
};

const testUser2 = {
  userName: 'tUser2',
  profileName: 'user2pname',
  email: 'user2@gmail.com',
  password: '1q2w3e4r5t@',
  confirmPassword: '1q2w3e4r5t@',
};

describe('Users', () => {
  describe('POST /users (회원가입)', () => {
    describe('회원가입에 성공하면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      let testUser = copyAndFreeze(testUser1);

      it('response로 201 status, profileName, email을 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(testUser)
          .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.have.property('profileName', testUser.profileName);
            res.body.should.have.property('email', testUser.email);
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

    describe('password와 comfirmPassword가 다르면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      let carelessUser = {
        userName: 'carelessUser',
        profileName: 'chris',
        email: 'cpb@gmail.com',
        password: '1q2w3e4r5t@',
        confirmPassword: 'DIFFERENT_PASSWORD@',
      };

      it('response로 403 error와 WRONG_COMFIRM_PASSWORD message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.WRONG_COMFIRM_PASSWORD
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('비밀번호가 8~20자리 숫자,영어,특수문자로 조합되지 않으면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      let carelessUser = {
        userName: 'carelessUser',
        profileName: 'chris',
        email: 'cpb@gmail.com',
        password: 'PLAINstring',
        confirmPassword: 'PLAINstring',
      };

      it('response로 403 error와 NVALID_PASSWORD message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.INVALID_PASSWORD
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('입력하지 않은 정보가 있다면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      let carelessUser = {
        userName: 'Idonthaveemail',
        profileName: '',
        email: null,
        password: '1q2w3e4r5t@',
        confirmPassword: '1q2w3e4r5t@',
      };

      it('response로 403 error와 EMPTY_USERINFO message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.EMPTY_USERINFO
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('E-mail 형식이 틀렸다면', () => {
      before(done => {
        clearCollection(User, done);
      });
      after(done => {
        clearCollection(User, done);
      });

      let carelessUser = {
        userName: 'wronEmail',
        profileName: 'mailMan',
        email: 'THISisWRONGemail',
        password: '1q2w3e4r5t@',
        confirmPassword: '1q2w3e4r5t@',
      };

      it('response로 403 error와 INVALID_EMAIL message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.INVALID_EMAIL
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('동일한 userName 또는 email이 이미 존재한다면', () => {
      let oldUser = copyAndFreeze(testUser1);
      let newUser = copyAndFreeze(testUser2);

      oldUser.userName = 'SAME';
      oldUser.email = 'same@same.com';

      newUser.userName = 'SAME';
      newUser.email = 'same@same.com';

      before(done => {
        clearCollection(User, done);
      });

      before(done => {
        User.create(oldUser)
          .then(user => {
            done();
          })
          .catch(err => {
            console.err(err);
            done();
          });
      });

      after(done => {
        clearCollection(User, done);
      });

      it('response로 403 error와 DUPLICATED_USERINFO message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.DUPLICATED_USERINFO
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ profileName: newUser.profileName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('username에 영어,숫자,하이픈(-) 을 제외한 특수문자가 있다면 ', () => {
      let newUser = copyAndFreeze(testUser1);
      newUser.userName = '!@#$%^&';

      before(done => {
        clearCollection(User, done);
      });

      after(done => {
        clearCollection(User, done);
      });

      it('response로 403 error와 INVALID_USERNAME message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.INVALID_USERNAME
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: newUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('profileName이 20자를 초과한다면', () => {
      let newUser = copyAndFreeze(testUser1);
      newUser.profileName = '123456789012345678901';

      before(done => {
        clearCollection(User, done);
      });

      after(done => {
        clearCollection(User, done);
      });

      it('response로 403 error와 INVALID_PROFILENAME message를 받는다', done => {
        chai
          .request(server)
          .post(API_URI + '/users')
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property(
              'message',
              USER_MESSAGE.ERROR.INVALID_PROFILENAME
            );
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', done => {
        User.findOne({ userName: newUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
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
