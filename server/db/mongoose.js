const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
// mongoose.connect('mongodb://jitu-sehrawat:Google123@ds157064.mlab.com:57064/udemy-node-todos-api', {useNewUrlParser: true});

module.exports = {
  mongoose
};