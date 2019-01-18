var expressWinston = require('express-winston');
var winston = require('winston'); // for transports.Console
var options = {
  file: {
    level: 'info',
    filename: `server/logs/${new Date().getUTCDate()}-${new Date().getMonth() + 1}-${new Date().getUTCFullYear()}.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

expressWinston.requestWhitelist.push('body'); //for req.body all data
expressWinston.responseWhitelist.push('body');

// express-winston logger makes sense BEFORE the router
var logger = expressWinston.logger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
});


module.exports = {
  logger
}