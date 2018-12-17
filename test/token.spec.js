/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const TokenManager = require('../util/token');

const payload = {
  _id: '12345',
  email: 'abc@gmail.com',
};

describe('#TokenManager', () => {
  describe('.constructor', () => {
    it('항상 같은 객체를 반환해야한다. (singleton)', () => {
      const first = new TokenManager();
      const second = new TokenManager();
      const third = new TokenManager();

      first.should.be.equal(second);
      first.should.be.equal(third);
    });
  });
  describe('.signToken', () => {
    const tm = new TokenManager();
    it('프로미스를 반환해야한다.', () => {
      const promise = tm.signToken(payload._id, payload.email);
      promise.should.be.a('Promise');
    });
    it('토큰이 생성되어야한다.', (done) => {
      const getToken = tm.signToken(payload._id, payload.email);
      getToken
        .then((token) => {
          should.exist(token);
          token.should.be.a('string');
          token.should.include('.');
          done();
        })
        .catch((err) => {
          should.not.exist(err);
          done();
        });
    });
  });
  describe('.decodeToken', () => {
    const tm = new TokenManager();
    let token;

    beforeEach((done) => {
      const getToken = tm.signToken(payload._id, payload.email);
      getToken
        .then((result) => {
          should.exist(result);
          token = result;
          done();
        })
        .catch((err) => {
          should.not.exist(err);
          done();
        });
    });
    it('프로미스를 반환해야한다.', () => {
      const promise = tm.decodeToken(token);

      promise.should.be.a('Promise');
    });
    it('유저정보를 반환해야한다.', (done) => {
      const decodeToken = tm.decodeToken(token);
      decodeToken.then((decoded) => {
        decoded._id.should.be.equal(payload._id);
        decoded.email.should.be.equal(payload.email);
        done();
      });
    });
  });
  describe('.signImmediatelyExpiredToken', () => {
    const tm = new TokenManager();

    it('프로미스를 반환해야한다.', () => {
      const promise = tm.signImmediatelyExpiredToken(
        payload._id,
        payload.email,
      );
      promise.should.be.a('Promise');
    });
    it('발급된 토큰은 즉시 만료되어야한다.', async () => {
      const getToken = tm.signImmediatelyExpiredToken(
        payload._id,
        payload.email,
      );
      const token = await getToken;

      const decodeToken = tm.decodeToken(token);

      const decoded = await decodeToken.catch((err) => {
        should.exist(err);
      });

      should.not.exist(decoded);
    });
  });
});
