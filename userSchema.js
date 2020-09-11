const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//vytvoreni user schema pro mongoose https://mongoosejs.com/docs/
var UserS = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//vytvori token
UserS.methods.generateAuthToken = async function () {
  var user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "tnpw2");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
//deklkarace tatcike autentikacni fce pro mongoose https://mongoosejs.com/docs/guide.html#statics
UserS.statics.authenticate = function (email, password, callback) {
  //hleda usera s danymi param v db https://mongoosejs.com/docs/api.html#model_Model.findOne
  User.findOne({ email: email }).exec(function (err, user) {
    if (err) {
      return callback(err);
    } else if (!user) {
      var err = "User does not exist.";
      err.status = 401;
      return callback(err);
    }
    //pokud user existuje bcrypt porovna hasnute heslo se zadanym pokud success varti usera jinak nic
    bcrypt.compare(password, user.password, function (err, result) {
      console.log(
        "password: " +
          password +
          " user.password :" +
          user.password +
          " result: " +
          result
      );
      if (result === true) {
        return callback(null, user);
      } else {
        var err = "passord is incorrect";

        return callback(err);
      }
    });
  });
};
// pred ulozenim uzivatele do db zahashuje heslo - pre je middlevare ktery se spusit pri dane jakemkoli behu dane db fce https://mongoosejs.com/docs/middleware.html#pre
UserS.pre("save", function (next) {
  var user = this;
  console.log("heslo pred hashem: " + user.password);
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

var User = mongoose.model("User", UserS);

// vyexportovani mistniho schematu
module.exports = User;
