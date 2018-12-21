/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  username: String,
  profileName: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
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
