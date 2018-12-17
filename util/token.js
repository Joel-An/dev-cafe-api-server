const jwt = require('jsonwebtoken');
const { JwtSecretKey } = require('../config/config');
const TokenError = require('./TokenError');

let instance;

class TokenManager {
  constructor() {
    if (instance) return instance;

    this.payload = {
      _id: '',
      email: '',
    };

    this.jwt = jwt;
    this.JwtSecretKey = JwtSecretKey;
    this.signOptions = { expiresIn: 60 * 60 * 1 };
    this.decodeOptions = {};

    instance = this;
  }

  signToken(_id, email, options) {
    const payload = { ...this.payload, _id, email };
    const signOptions = options || this.signOptions;

    return new Promise((resolve, reject) => {
      this.jwt.sign(payload, this.JwtSecretKey, signOptions, (err, token) => {
        if (err) {
          reject(new TokenError(err));
        }

        resolve(token);
      });
    });
  }

  decodeToken(accessToken) {
    return new Promise((resolve, reject) => {
      this.jwt.verify(accessToken, this.JwtSecretKey, (err, token) => {
        if (err) {
          reject(new TokenError(err));
        }

        resolve(token);
      });
    });
  }

  signImmediatelyExpiredToken(_id, email) {
    const options = { ...this.signOptions, expiresIn: '300' };

    return this.signToken(_id, email, options);
  }
}

module.exports = TokenManager;
