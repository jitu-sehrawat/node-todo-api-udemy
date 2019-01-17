require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose }= require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, async (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  try {
    const doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);  
  }
})

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ _creator: req.user._id });
    res.send({ todos });
  } catch (e) {
    res.status(400).send(e);  
  }
});

app.get('/todos/:id', authenticate, async (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOne({ _id: id, _creator: req.user._id });  
    if (!todo) {
      return res.status(404).send();      
    } else {
      res.status(200).send({ todo });
    }
  } catch (e) {
    res.status(400).send();  
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndDelete({ _id: id, _creator: req.user.id });

    if (!todo) {
      return res.status(404).send('Not Found');      
    } else {
      res.status(200).send({
        todo
      });
    }
  } catch (e) {
    res.status(400).send();  
  }
});

app.put(`/todos/:id`, authenticate, async (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (body.completed && _.isBoolean(body.completed)) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  try {
    const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, {new: true});
    if (!todo) {
      return res.status(400).send();
    }

    res.status(200).send({ todo });
  } catch (e) {
    res.status(400).send();  
  }
});


// POST /users
app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth', token).send(user);  
  } catch (e) {
    res.status(400).send(e);  
  }
});

app.get(`/users/me`, authenticate, (req, res) => {
  res.send(req.user);
})

// POST /users/login
app.post(`/users/login`, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);  
  } catch (e) {
    res.status(400).send();  
  }
}); 

app.delete(`/users/me/token`, authenticate, async (req, res) => {
  try {
    let user = new User(req.user);

    await user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();  
  }
})

app.listen(port, () => {
  console.log(`Started up at port ${port} \n\n\n`)
});

module.exports = {
  app
};