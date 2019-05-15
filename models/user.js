/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { DEFAULT_PROFILE_PICTURE } = require('../config/config');

const { Schema } = mongoose;

const { OauthProviderSchema } = require('./oauthProvider');

const userSchema = new Schema({
  username: String,
  profileName: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  profilePic: { type: String, default: DEFAULT_PROFILE_PICTURE },
  notificationCheckDate: { type: Date, default: Date.now },
  oauthProvider: OauthProviderSchema,
});

// password를 암호화
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// password의 유효성 검증
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
