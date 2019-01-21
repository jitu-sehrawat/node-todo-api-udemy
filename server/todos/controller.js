const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { Todo } = require('./model');

module.exports = {
  create,
  getall,
  getById,
  deleteById,
  update
};

async function create (req, res) {
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
}

async function getall (req, res) {
  try {
    const todos = await Todo.find({ _creator: req.user._id });

    res.send({ todos });
  } catch (e) {
    res.status(400).send(e);
  }
}

async function getById (req, res) {
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
}

async function deleteById (req, res) {
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
}

async function update (req, res) {
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
    const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true });

    if (!todo) {
      return res.status(400).send();
    }

    res.status(200).send({ todo });
  } catch (e) {
    res.status(400).send();
  }
}
