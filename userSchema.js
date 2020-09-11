const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var UserS = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
    },
    passwordII: {
      type: String,
      required: true,
    }
  });
  UserS.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email }).exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {
        var err = new Error("User not found.");
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
  };
  
  
  UserS.pre('save', function () {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return console.log(err);
      }
      user.password = hash;
    })
  });
var User = mongoose.model('User', UserS);
module.exports = User;