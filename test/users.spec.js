/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { USER_ERR } = require('../constants/message');
const TokenManager = require('../util/token');

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
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const testUser = copyAndFreeze(testUser1);

      it('response로 201 status, profileName, email을 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(testUser)
          .end((err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.have.property('profileName', testUser.profileName);
            res.body.should.have.property('email', testUser.email);
            done();
          });
      });

      it('DB에 회원정보가 저장되어 있어야한다', (done) => {
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
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = {
        userName: 'carelessUser',
        profileName: 'chris',
        email: 'cpb@gmail.com',
        password: '1q2w3e4r5t@',
        confirmPassword: 'DIFFERENT_PASSWORD@',
      };

      it('response로 403 error와 WRONG_COMFIRM_PASSWORD message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.WRONG_COMFIRM_PASSWORD);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('비밀번호가 8~20자리 숫자,영어,특수문자로 조합되지 않으면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = {
        userName: 'carelessUser',
        profileName: 'chris',
        email: 'cpb@gmail.com',
        password: 'PLAINstring',
        confirmPassword: 'PLAINstring',
      };

      it('response로 403 error와 NVALID_PASSWORD message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.INVALID_PASSWORD);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('입력하지 않은 정보가 있다면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = {
        userName: 'Idonthaveemail',
        profileName: '',
        email: null,
        password: '1q2w3e4r5t@',
        confirmPassword: '1q2w3e4r5t@',
      };

      it('response로 403 error와 EMPTY_USERINFO message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.EMPTY_USERINFO);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('E-mail 형식이 틀렸다면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = {
        userName: 'wronEmail',
        profileName: 'mailMan',
        email: 'THISisWRONGemail',
        password: '1q2w3e4r5t@',
        confirmPassword: '1q2w3e4r5t@',
      };

      it('response로 403 error와 INVALID_EMAIL message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(carelessUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.INVALID_EMAIL);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: carelessUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('동일한 userName 또는 email이 이미 존재한다면', () => {
      const oldUser = copyAndFreeze(testUser1);
      const newUser = copyAndFreeze(testUser2);

      oldUser.userName = 'SAME';
      oldUser.email = 'same@same.com';

      newUser.userName = 'SAME';
      newUser.email = 'same@same.com';

      before((done) => {
        clearCollection(User, done);
      });

      before((done) => {
        User.create(oldUser)
          .then(() => {
            done();
          })
          .catch((err) => {
            console.error(err);
            done();
          });
      });

      after((done) => {
        clearCollection(User, done);
      });

      it('response로 403 error와 DUPLICATED_USERINFO message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.DUPLICATED_USERINFO);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ profileName: newUser.profileName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('username에 영어,숫자,하이픈(-) 을 제외한 특수문자가 있다면 ', () => {
      const newUser = copyAndFreeze(testUser1);
      newUser.userName = '!@#$%^&';

      before((done) => {
        clearCollection(User, done);
      });

      after((done) => {
        clearCollection(User, done);
      });

      it('response로 403 error와 INVALID_USERNAME message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.INVALID_USERNAME);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: newUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    describe('profileName이 20자를 초과한다면', () => {
      const newUser = copyAndFreeze(testUser1);
      newUser.profileName = '123456789012345678901';

      before((done) => {
        clearCollection(User, done);
      });

      after((done) => {
        clearCollection(User, done);
      });

      it('response로 403 error와 INVALID_PROFILENAME message를 받는다', (done) => {
        chai
          .request(server)
          .post(`${API_URI}/users`)
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(403);
            res.should.be.json;
            res.body.should.have.property('message', USER_ERR.INVALID_PROFILENAME);
            done();
          });
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ userName: newUser.userName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });
  });

  describe('DELETE /users/me (회원탈퇴)', () => {
    const testUser = copyAndFreeze(USER_ARRAY[0]);
    let token;

    // 회원 탈퇴 요청 (토큰, 비밀번호)
    const requestUnregister = (userToken, password) => chai
      .request(server)
      .delete(`${API_URI}/users/me`)
      .set('x-access-token', userToken)
      .send({ password });

    const findUserByUsername = userName => User.findOne({ userName }).catch(err => shoud.not.exist(err));

    beforeEach((done) => {
      // 회원가입
      chai
        .request(server)
        .post(`${API_URI}/users`)
        .send(testUser)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    beforeEach((done) => {
      // 로그인
      chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send({ userName: testUser.userName, password: testUser.password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('accessToken');
          token = res.body.accessToken;
          done();
        });
    });
    afterEach((done) => {
      clearCollection(User, done);
    });
    context('성공하면', () => {
      it('204코드를 받고 DB에 회원정보가 없어야한다', async () => {
        const res = await requestUnregister(token, testUser.password);

        res.should.have.status(204);

        const user = await findUserByUsername(testUser.userName);
        should.not.exist(user);
      });
    });

    context('탈퇴성공후 재요청하면', () => {
      it('404코드를 받고 DB에 회원정보가 없어야한다', async () => {
        const firstResponse = await requestUnregister(token, testUser.password);
        firstResponse.should.have.status(204);

        const SecondResponse = await requestUnregister(token, testUser.password);
        SecondResponse.should.have.status(404);

        const user = await findUserByUsername(testUser.userName);
        should.not.exist(user);
      });
    });

    context('토큰이 없으면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const emptyToken = '';
        const res = await requestUnregister(emptyToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.userName);
        should.exist(user);
      });
    });

    context('비밀번호가 없으면', () => {
      it('400 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const emptyPassword = '';
        const res = await requestUnregister(token, emptyPassword);

        res.should.have.status(400);

        const user = await findUserByUsername(testUser.userName);
        should.exist(user);
      });
    });

    context('토큰이 불량이라면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const wrongToken = 'WRONG_TOKEN';
        const res = await requestUnregister(wrongToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.userName);
        should.exist(user);
      });
    });

    context('토큰이 만료되었다면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const tokenManager = new TokenManager();
        const decoded = await tokenManager.decodeToken(token);
        const expiredToken = await tokenManager.signImmediatelyExpiredToken(
          decoded._id,
          decoded.email,
        );
        const res = await requestUnregister(expiredToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.userName);
        should.exist(user);
      });
    });

    context('비밀번호가 다르면', () => {
      it('403 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const res = await requestUnregister(token, 'WRONG_PASSWORD');

        res.should.have.status(403);

        const user = await findUserByUsername(testUser.userName);
        should.exist(user);
      });
    });
  });

  describe.skip('GET /users', () => {
    it('it should GET all users', (done) => {
      chai
        .request(server)
        .get(`${API_URI}/users`)
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
