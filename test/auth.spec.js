/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { AUTH_ERR } = require('../constants/message');

const reqLogin = (userName, password) => chai
  .request(server)
  .post(`${API_URI}/auth`)
  .send({ userName, password });

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
      clearCollection(User, done);
    });
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

    it('로그인에 성공하면 response로 200 code와 엑세스 토큰을 받아야한다', async () => {
      const res = await reqLogin(testUser1.userName, testUser1.password);

      res.should.have.status(200);
      res.should.be.json;
      res.body.should.have.property('accessToken');
    });

    it('존재하지 않는 유저라면 response로 403 error와 WRONG_USERNAME message를 받아야한다', async () => {
      const res = await reqLogin('ImNotExist', testUser1.password);

      res.should.have.status(403);
      res.should.be.json;
      res.body.should.have.property('message', AUTH_ERR.WRONG_USERNAME);
    });

    it('비밀번호가 잘못되었다면 response로 403 error와 WRONG_PASSWORD message를 받아야한다', async () => {
      const res = await reqLogin(testUser1.userName, 'WrongPassword');

      res.should.have.status(403);
      res.should.be.json;
      res.body.should.have.property('message', AUTH_ERR.WRONG_PASSWORD);
    });

    it('사용자이름/비밀번호를 입력하지 않았다면 403 error와 EMPTY_LOGINFORM message를 받아야한다', async () => {
      const emptyPassword = reqLogin(testUser1.userName, '');
      const emptyUsername = reqLogin('', testUser1.password);

      const results = await Promise.all([emptyPassword, emptyUsername]);
      const emptyPasswordResponse = results[0];
      const emptyUsernameResponse = results[1];

      emptyPasswordResponse.should.have.status(403);
      emptyPasswordResponse.body.should.have.property(
        'message',
        AUTH_ERR.EMPTY_LOGINFORM
      );

      emptyUsernameResponse.should.have.status(403);
      emptyUsernameResponse.body.should.have.property(
        'message',
        AUTH_ERR.EMPTY_LOGINFORM
      );
    });
  });
});
