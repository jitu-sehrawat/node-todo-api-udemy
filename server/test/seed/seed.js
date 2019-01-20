const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('../../users/model');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'userOneEmail@gmail.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'userTwoEmail@gmail.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateUsers = async () => {
  await User.deleteMany({});
  await new User(users[0]).save();
  await new User(users[1]).save();

  // No need to return done() or Promise.resolve if using async-await
};

const populateTodos = async () => {
  await Todo.deleteMany({});
  await Todo.insertMany(todos);
  
  // No need to return done() or Promise.resolve if using async-await
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}