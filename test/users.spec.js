/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { USER_ERR } = require('../constants/message');
const TokenManager = require('../util/token');


describe('Users', () => {
  describe('POST /users (회원가입)', () => {
    context('회원가입에 성공하면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });
      const testUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 201 status, profileName, email을 받는다', async () => {
        const res = await reqRegister(testUser);

        res.should.have.status(201);
        res.should.be.json;
        res.body.should.have.property('profileName', testUser.profileName);
        res.body.should.have.property('email', testUser.email);
      });

      it('DB에 회원정보가 저장되어 있어야한다', (done) => {
        User.findOne({ username: testUser.username }, (err, user) => {
          should.exist(user);
          should.not.exist(err);
          user.should.have.property('username', user.username);
          user.should.have.property('profileName', user.profileName);
          user.should.have.property('email', user.email);
          done();
        });
      });

      it('첫 가입자는 admin이 된다', async () => {
        const user = await User.findOne({ username: testUser.username });
        assert.equal(user.isAdmin, true);
      });

      it('두번째 가입자는 일반회원이 된다', async () => {
        const secondUser = copyAndFreeze(USER_ARRAY[1]);
        const res = await reqRegister(secondUser);
        res.should.have.status(201);

        const user2 = await User.findOne({ username: secondUser.username });
        assert.equal(user2.isAdmin, false);
      });
    });

    context('password와 comfirmPassword가 다르면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 WRONG_COMFIRM_PASSWORD message를 받는다', async () => {
        carelessUser.confirmPassword = 'DIFFERENT_PASSWORD@';

        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property(
          'message',
          USER_ERR.WRONG_COMFIRM_PASSWORD
        );
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('비밀번호가 8~20자리 숫자,영어,특수문자로 조합되지 않으면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });
      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 NVALID_PASSWORD message를 받는다', async () => {
        carelessUser.password = 'plainText';
        carelessUser.confirmPassword = 'plainText';

        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.INVALID_PASSWORD);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('입력하지 않은 정보가 있다면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 EMPTY_USERINFO message를 받는다', async () => {
        carelessUser.email = '';
        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.EMPTY_USERINFO);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('E-mail 형식이 틀렸다면', () => {
      before((done) => {
        clearCollection(User, done);
      });
      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 INVALID_EMAIL message를 받는다', async () => {
        carelessUser.email = 'wrong#gmail.com';
        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.INVALID_EMAIL);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('동일한 username 또는 email이 이미 존재한다면', () => {
      const oldUser = copyAndFreeze(USER_ARRAY[0]);
      const newUser = copyAndFreeze(USER_ARRAY[1]);

      oldUser.username = 'SAME';
      oldUser.email = 'same@same.com';

      newUser.username = 'SAME';
      newUser.email = 'same@same.com';

      before((done) => {
        clearCollection(User, done);
      });

      before(async () => {
        const res = await reqRegister(oldUser);
        res.should.have.status(201);
      });

      after((done) => {
        clearCollection(User, done);
      });

      it('response로 403 error와 DUPLICATED_USERINFO message를 받는다', async () => {
        const res = await reqRegister(newUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.DUPLICATED_USERINFO);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ profileName: newUser.profileName }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('username에 영어,숫자,하이픈(-) 을 제외한 특수문자가 있다면 ', () => {
      before((done) => {
        clearCollection(User, done);
      });

      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 INVALID_USERNAME message를 받는다', async () => {
        carelessUser.username = '!@#$%^&';
        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.INVALID_USERNAME);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });

    context('profileName이 20자를 초과한다면', () => {
      const newUser = copyAndFreeze(USER_ARRAY[0]);
      newUser.profileName = '123456789012345678901';

      before((done) => {
        clearCollection(User, done);
      });

      after((done) => {
        clearCollection(User, done);
      });

      const carelessUser = copyAndFreeze(USER_ARRAY[0]);

      it('response로 403 error와 INVALID_PROFILENAME message를 받는다', async () => {
        carelessUser.profileName = '123456789012345678901';
        const res = await reqRegister(carelessUser);

        res.should.have.status(403);
        res.should.be.json;
        res.body.should.have.property('message', USER_ERR.INVALID_PROFILENAME);
      });
      it('DB에 회원정보가 없어야한다', (done) => {
        User.findOne({ username: carelessUser.username }, (err, user) => {
          should.not.exist(user);
          should.not.exist(err);
          done();
        });
      });
    });
  });

  describe('DELETE /users/me (회원탈퇴)', () => {
    const testUser = copyAndFreeze(USER_ARRAY[0]);
    let validToken;

    // 회원 탈퇴 요청 (토큰, 비밀번호)
    const requestUnregister = (userToken, password) => requester
      .delete(`${API_URI}/users/me`)
      .set('x-access-token', userToken)
      .send({ password });

    const findUserByUsername = username => User.findOne({ username });

    beforeEach(async () => {
      // 회원가입
      const register = await reqRegister(testUser);
      register.should.have.status(201);

      // 로그인
      const login = await reqLogin(testUser.username, testUser.password);

      login.should.have.status(201);
      login.body.should.have.property('accessToken');
      validToken = login.body.accessToken;
    });
    afterEach((done) => {
      clearCollection(User, done);
    });
    context('성공하면', () => {
      it('204코드를 받고 DB에 회원정보가 없어야한다', async () => {
        const res = await requestUnregister(validToken, testUser.password);

        res.should.have.status(204);

        const user = await findUserByUsername(testUser.username);
        should.not.exist(user);
      });
    });

    context('탈퇴성공후 재요청하면', () => {
      it('404코드를 받고 DB에 회원정보가 없어야한다', async () => {
        const firstResponse = await requestUnregister(
          validToken,
          testUser.password
        );
        firstResponse.should.have.status(204);

        const SecondResponse = await requestUnregister(
          validToken,
          testUser.password
        );
        SecondResponse.should.have.status(404);

        const user = await findUserByUsername(testUser.username);
        should.not.exist(user);
      });
    });

    context('토큰이 없으면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const emptyToken = '';
        const res = await requestUnregister(emptyToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.username);
        should.exist(user);
      });
    });

    context('비밀번호가 없으면', () => {
      it('400 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const emptyPassword = '';
        const res = await requestUnregister(validToken, emptyPassword);

        res.should.have.status(400);

        const user = await findUserByUsername(testUser.username);
        should.exist(user);
      });
    });

    context('토큰이 불량이라면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const wrongToken = 'WRONG_TOKEN';
        const res = await requestUnregister(wrongToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.username);
        should.exist(user);
      });
    });

    context('토큰이 만료되었다면', () => {
      it('401 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const tokenManager = new TokenManager();
        const decoded = await tokenManager.decodeToken(validToken);
        const expiredToken = await tokenManager.signImmediatelyExpiredToken(
          decoded._id,
          decoded.email
        );
        const res = await requestUnregister(expiredToken, testUser.password);

        res.should.have.status(401);

        const user = await findUserByUsername(testUser.username);
        should.exist(user);
      });
    });

    context('비밀번호가 다르면', () => {
      it('403 코드를 받고, DB에 회원정보가 존재해야한다', async () => {
        const res = await requestUnregister(validToken, 'WRONG_PASSWORD');

        res.should.have.status(403);

        const user = await findUserByUsername(testUser.username);
        should.exist(user);
      });
    });
  });

  describe('GET /users/me', () => {
    const testUser = copyAndFreeze(USER_ARRAY[0]);
    let token;

    const getMyInfo = userToken => requester
      .get(`${API_URI}/users/me`)
      .set('x-access-token', userToken);

    before(async () => {
      // 회원가입
      const register = await reqRegister(testUser);
      register.should.have.status(201);

      // 로그인
      const login = await reqLogin(testUser.username, testUser.password);

      login.should.have.status(201);
      login.body.should.have.property('accessToken');
      token = login.body.accessToken;
    });

    it('성공하면 200코드, profileName을 받는다', async () => {
      const res = await getMyInfo(token);
      res.should.have.status(200);
      res.body.should.have.property('myInfo');

      const { myInfo } = res.body;

      assert(myInfo.profileName, testUser.profileName);
    });

    it('토큰이 없다면 401코드를 받는다 ', async () => {
      const emptyToken = null;
      const res = await getMyInfo(emptyToken);
      res.should.have.status(401);
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
