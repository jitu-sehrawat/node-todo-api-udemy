const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Schema methods
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  // Adding Token to res.body.token incase we need to send token in response Body
  userObject.token = userObject.tokens[userObject.tokens.length - 1].token;

  return _.pick(userObject, ['_id', 'email', `token`]);
};

// Schema methods
UserSchema.methods.generateAuthToken = async function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

  user.tokens.push({ access, token });
  await user.save();

  return token;
};

// Schema methods
UserSchema.methods.removeToken = async function (token) {
  let user = this;

  try {
    let result = await user.update({
      $pull: {
        tokens: {
          token: token
        }
      }
    });

    return result;
  } catch (e) {
    throw new Error(e);
  }
};

// Model methods
UserSchema.statics.findByToken = async function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new Error(e);
  }

  try {
    let user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });

    return user;
  } catch (e) {
    throw new Error(e);
  }
};

// Model methods
// bcrypt hasging does not support promises. So does not async-await
UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      let errMsg = `User not found`;

      return Promise.reject(errMsg);
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        return result ? resolve(user) : reject(err);
      });
    });
  });
};

// bcrypt hasging does not support promises. So does not async-await
UserSchema.pre('save', function (next) {
  let user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        throw new Error(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          throw new Error(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
