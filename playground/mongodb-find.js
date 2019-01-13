const { MongoClient, ObjectID } = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect(`mongodb://localhost:27017/TodoApp`, (err, client) => {
  if (err) {
    console.log(`Unable to connect to Db server. Error: ${err}`);
  } 
  
  console.log(`Connected to MongoDb Server`);

  const db = client.db('TodoApp');

  // db.collection('Todos').find().toArray().then((docs) => {
  //   console.log(`Todos`);
  //   console.log(JSON.stringify(docs,null, 2));
  // }, (err) => {
  //   console.log(`Unable to fetch todos. ${err}`)
  // });

  // db.collection('Todos').find({_id: new ObjectID('5c3b63d9258d7d06a605e8bb')}).toArray().then((docs) => {
  //   console.log(`Todos`);
  //   console.log(JSON.stringify(docs,null, 2));
  // }, (err) => {
  //   console.log(`Unable to fetch todos. ${err}`)
  // });

  db.collection('Todos').find().count().then((docs) => {
    console.log(`Todos counts: ${docs}`);
  }, (err) => {
    console.log(`Unable to fetch todos. ${err}`)
  });

  // client.close();
}); 