const expect = require('expect');
const request = require('supertest');
const { ObjectID }= require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe(`POST /todos`, () => {
  it(`should create a new todo`, (done) => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it(`should not create todo with invalid body data`, (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });
});

describe(`GET /todos`, () => {
  it(`should get all todos`, (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe(`GET /todos/:id`, () => {
  it(`should return todo doc`, (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it(`should return 404 if todo not found`,(done) => {
    request(app)
    .get(`/todos/${new ObjectID().toHexString()}`)
    .expect(404)
    .end(done);
  });

  it(`should return 404 for non-Objects ids`, (done) => {
    request(app)
      .get(`/todos/1234`)
      .expect(404)
      .end(done);
  });
});

describe(`DELETE /todos/:id`, () => {
  it(`should remove a todo`, (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBe(null);
          done();
        }).catch((e) => {
          done(e);
        });
      })
  });

  it(`should return 404 if todo not found`, (done) => {

    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it(`should return 404 if object Id is invalid`, (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe(`PUT /todos/:id`, () => {
  it(`should update the todo`, (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .put(`/todos/${hexId}`)
      .send({
        text: 'Updated from Test cases',
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('Updated from Test cases');
        expect(res.body.todo.completed).toBe(true);
        expect(typeof(res.body.todo.completedAt)).toBe('number');
      })
      .end(done);
  });

  it(`should clear the completedAt when todo is not completed`, (done) => {

    let hexId = todos[1]._id.toHexString();

    request(app)
      .put(`/todos/${hexId}`)
      .send({
        text: 'Updated from Test cases',
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('Updated from Test cases');
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

