const expect = require('expect');
const request = require('supertest');
const { ObjectID }= require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
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
      .set('x-auth', users[0].tokens[0].token)
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


  it(`should not remove a todo of other user`, (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).not.toBe(null);
          done();
        }).catch((e) => {
          done(e);
        });
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

describe(`GET /users/me`, () => {
  it(`should return user if authenticated`, (done) => {
    request(app)
    .get(`/users/me`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    })
    .end(done);
  });

  it(`should return 401 if not authenticated`, (done) => {
    request(app)
    .get(`/users/me`)
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    })
    .end(done);
  });
});

describe(`POST /users`, () => {
  it(`should create a user`, (done) => {
    let email = 'testEmail@gmail.com';
    let password = 'pass123';

    request(app)
      .post(`/users`)
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {   // Calling Test DB to check if user indeed created
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.email).toBe(email);
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });

  });

  it(`should return validation error if request invalid`, (done) => {   
    let email = 'testEmaill.com';
    let password = 'pass123';

    request(app)
      .post(`/users`)
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it(`should not create user if email in use`, (done) => {
    
    let email = users[0].email;
    let password = 'pass123';

    request(app)
      .post(`/users`)
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe(`POST /users/login`, () => {
  it(`should login user and return auth token`, (done) => {
    request(app)
      .post(`/users/login`)
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it(`should reject invalid login`, (done) => {
    request(app)
      .post(`/users/login`)
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe(`DELETE /users/me/token`, () => {
  it(`should remove auth token on logout`, () => {
    let token = users[0].tokens[0].token;

    request(app)
      .delete(`/users/me/token`)
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          return done(err)
        }
        user.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });
});