const jwt = require('jsonwebtoken');
const { JwtSecretKey } = require('../config/config');

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

  setPayload(id, email) {
    this.payload._id = id;
    this.payload.email = email;
  }

  signToken(_id, email) {
    const payload = { ...this.payload, _id, email };

    return new Promise((resolve, reject) => {
      this.jwt.sign(payload, this.JwtSecretKey, this.signOptions, (err, token) => {
        if (err) {
          reject(err);
        }

        resolve(token);
      });
    });
  }

  decodeToken(accessToken) {
    return new Promise((resolve, reject) => {
      this.jwt.verify(accessToken, this.JwtSecretKey, (err, token) => {
        if (err) {
          reject(err);
        }

        resolve(token);
      });
    });
  }
}

module.exports = TokenManager;
