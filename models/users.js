var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  hash: String,
  salt: String,
});

//Creates the hash/salt during registration
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

//Check if the password is correct during login
UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

//Generates a JSON web token
UserSchema.methods.generateJWT = function() {
  var date = new Date();
  date.setDate(date.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(date.getTime() / 1000),
  }, 'C7F209A547201848BB7BD887A18D9FD7D45D14EE293614C09A734DA4A389E589'); //Secret key should be generated on install/start
};

mongoose.model('User', UserSchema);
