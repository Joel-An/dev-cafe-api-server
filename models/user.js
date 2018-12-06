var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

var userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  userType: { type: String, enum: ["Guest", "User", "Admin"], default: "User" }
});

//password를 암호화
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//password의 유효성 검증
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("User", userSchema);
