const { MongoClient, ObjectID } = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect(`mongodb://localhost:27017/TodoApp`, (err, client) => {
  if (err) {
    console.log(`Unable to connect to Db server. Error: ${err}`);
  } 
  
  console.log(`Connected to MongoDb Server`);
  // const db = client.db('TodoApp');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log(`unable to insert todo. Error: ${err}`);
  //   }

  //   console.log(JSON.stringify(result.ops, null, 2));
  // });

  const db = client.db('TodoApp');

  db.collection('Users').insertOne({
    name: 'jitender sehrawat',
    age: 28,
    locations: 'Delhi'
  }, (err, result) => {
    if (err) {
      return console.log(`unable to insert todo. Error: ${err}`);
    }

    console.log(JSON.stringify(result.ops, null, 2));
  });

  client.close();
}); 