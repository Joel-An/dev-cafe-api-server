/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { AUTH_ERR } = require('../constants/message');

describe('Auth', () => {
  const testUser1 = {
    userName: 'Bacon',
    profileName: 'BaconPname',
    email: 'bacon@gmail.com',
    password: '1q2w3e4r5t@',

    confirmPassword: '1q2w3e4r5t@',
  };

  describe('POST /auth', () => {
    before((done) => {
      chai
        .request(server)
        .post(`${API_URI}/users`)
        .send(testUser1)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
    after((done) => {
      clearCollection(User, done);
    });

    it('로그인에 성공하면 response로 200 code와 엑세스 토큰을 받아야한다', (done) => {
      const loginForm = {
        userName: testUser1.userName,
        password: testUser1.password,
      };

      chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send(loginForm)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('accessToken');
          done();
        });
    });

    it('존재하지 않는 유저라면 response로 403 error와 WRONG_USERNAME message를 받아야한다', (done) => {
      const loginForm = {
        userName: 'ImGuest',
        password: testUser1.password,
      };

      chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send(loginForm)
        .end((err, res) => {
          res.should.have.status(403);
          res.should.be.json;
          res.body.should.have.property('message', AUTH_ERR.WRONG_USERNAME);
          done();
        });
    });

    it('비밀번호가 잘못되었다면 response로 403 error와 WRONG_PASSWORD message를 받아야한다', (done) => {
      const loginForm = {
        userName: testUser1.userName,
        password: 'wrongPassword',
      };

      chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send(loginForm)
        .end((err, res) => {
          res.should.have.status(403);
          res.should.be.json;
          res.body.should.have.property('message', AUTH_ERR.WRONG_PASSWORD);
          done();
        });
    });

    it('사용자이름/비밀번호를 입력하지 않았다면 403 error와 EMPTY_LOGINFORM message를 받아야한다', (done) => {
      const loginForm1 = {
        userName: 'emptyPassword',
        password: '',
      };

      const loginForm2 = {
        userName: '',
        password: 'emptyUsername',
      };

      const emptyPassword = chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send(loginForm1);

      const emptyUsername = chai
        .request(server)
        .post(`${API_URI}/auth`)
        .send(loginForm2);

      Promise.all([emptyPassword, emptyUsername])
        .then((results) => {
          const emptyPasswordResponse = results[0];
          const emptyUsernameResponse = results[0];

          emptyPasswordResponse.should.have.status(403);
          emptyPasswordResponse.body.should.have.property(
            'message',
            AUTH_ERR.EMPTY_LOGINFORM,
          );

          emptyUsernameResponse.should.have.status(403);
          emptyUsernameResponse.body.should.have.property(
            'message',
            AUTH_ERR.EMPTY_LOGINFORM,
          );
          done();
        })
        .catch((err) => {
          console.error(err);
          done();
        });
    });
  });
});
