const expect = require('expect');
const request = require('supertest');
const { ObjectID }= require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../todos/model');
const { todos, populateTodos, users, populateUsers } = require('./../seed/seed');

beforeEach(populateTodos);

describe(`POST /todos`, () => {
  it(`should create a new todo`, (done) => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end(async (err, res) => {
        if(err) {
          return done(err);
        }

        try {
          const todos = await Todo.find({text});
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        } catch (error) {
          done(e);
        }
      });
  });

  it(`should not create todo with invalid body data`, (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }

        try {
          const todos = await Todo.find();
          expect(todos.length).toBe(2);
          done();
        
        } catch (e) {
          done(e);
        }
      });
  });
});

describe(`GET /todos`, () => {
  it(`should get all todos`, (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe(`GET /todos/:id`, () => {
  it(`should return todo doc`, (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it(`should not return todo doc created by other user`, (done) => {
    request(app)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it(`should return 404 if todo not found`,(done) => {
    request(app)
    .get(`/todos/${new ObjectID().toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it(`should return 404 for non-Objects ids`, (done) => {
    request(app)
      .get(`/todos/1234`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe(`DELETE /todos/:id`, () => {
  it(`should remove a todo`, (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        
        try {
          const todo = await Todo.findById(hexId);
          expect(todo).toBe(null);
          done();
        } catch (e) {
          done(e);        
        }
      })
  });


  it(`should not remove a todo of other user`, (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }

        try {
          const todo = await Todo.findById(hexId);
          expect(todo).not.toBe(null);
          done();
        } catch (e) {
          done(e);        
        }
      })
  });

  it(`should return 404 if todo not found`, (done) => {

    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it(`should return 404 if object Id is invalid`, (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/123`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe(`PUT /todos/:id`, () => {
  it(`should update the todo`, (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .put(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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


  it(`should not update the todo created by other user`, (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .put(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text: 'Updated from Test cases',
        completed: true
      })
      .expect(400)
      .end(done);
  });

  it(`should clear the completedAt when todo is not completed`, (done) => {

    let hexId = todos[1]._id.toHexString();

    request(app)
      .put(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
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
