const jwt = require('jsonwebtoken');
const { JwtSecretKey } = require('../config/config');
const TokenError = require('./TokenError');

const DESELECT_PROPS = {
  email: undefined,
  password: undefined,
  __v: undefined,
};

let instance;

class TokenManager {
  constructor() {
    if (instance) return instance;

    this.jwt = jwt;
    this.JwtSecretKey = JwtSecretKey;
    this.signOptions = { expiresIn: 60 * 60 * 1 };
    this.decodeOptions = {};

    instance = this;
  }

  signToken(user, options) {
    const payload = {
      ...user,
      ...DESELECT_PROPS,
    };

    const signOptions = options || this.signOptions;

    return new Promise((resolve, reject) => {
      this.jwt.sign(payload, this.JwtSecretKey, signOptions, (err, token) => {
        if (err) {
          reject(new TokenError({ ...err }));
        }

        resolve(token);
      });
    });
  }

  decodeToken(accessToken) {
    return new Promise((resolve, reject) => {
      this.jwt.verify(accessToken, this.JwtSecretKey, (err, token) => {
        if (err) {
          reject(new TokenError({ ...err }));
        }

        resolve(token);
      });
    });
  }

  signImmediatelyExpiredToken(user) {
    const options = { ...this.signOptions, expiresIn: '300' };

    return this.signToken(user, options);
  }
}

module.exports = TokenManager;
