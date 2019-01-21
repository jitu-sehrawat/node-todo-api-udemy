const { User } = require('./model');
const _ = require('lodash');

module.exports = {
  register,
  getMe,
  login,
  logout
};

async function register (req, res) {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    // const result = await user.save();  // Sometime test case fails if user.save is not stored in variable
    await user.save();
    const token = user.generateAuthToken();

    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
}

async function getMe (req, res) {
  res.send(req.user);
}

async function login (req, res) {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();

    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
}

async function logout (req, res) {
  try {
    let user = new User(req.user);

    // const result = await user.removeToken(req.token);  // Sometime test case fails if user.removeToken is not stored in variable
    await user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
}
