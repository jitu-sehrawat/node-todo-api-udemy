require('./config/config');
require('./db/mongoose');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const helmet = require('helmet');

const { logger } = require('./config/logger');
const todoRoute = require('./todos/route');
const userRoute = require('./users/route');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(methodOverride());
app.use(compression());
app.use(helmet());
// app.use(logger)

// Routes
app.use('/todos', todoRoute);
app.use('/users', userRoute);

app.listen(port, () => {
  console.log(`Started up at port ${port} \n\n\n`)
});

module.exports = {
  app
};