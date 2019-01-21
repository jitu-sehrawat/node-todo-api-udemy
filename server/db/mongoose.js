// const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;
// mongoose.connect(process.env.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true });
// // mongoose.connect('mongodb://jitu-sehrawat:Google123@ds157064.mlab.com:57064/udemy-node-todos-api', {useNewUrlParser: true});

// module.exports = {
//   mongoose
// };

// require mongoose module
const mongoose = require('mongoose');

// require chalk module to give colors to console text
const chalk = require('chalk');

// require database URL from properties file
const dbURL = process.env.MONGODB_URI;

const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const disconnected = chalk.bold.red;
const termination = chalk.bold.magenta;

mongoose.connect(dbURL, { useCreateIndex: true, useNewUrlParser: true });

mongoose.connection.on('connected', function () {
  console.log(connected(`Mongoose default connection is open to `, dbURL));
});

mongoose.connection.on('error', function (err) {
  console.log(error(`Mongoose default connection has occured ${err} error`));
});

mongoose.connection.on('disconnected', function () {
  console.log(disconnected(`Mongoose default connection is disconnected`));
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log(termination(`Mongoose default connection is disconnected due to application termination`));
    process.exit(0);
  });
});

// export this function and imported by server.js
module.exports = {
  mongoose
};
