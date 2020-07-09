var log4js = require('log4js');

log4js.configure({
    appenders: {
      everything: { type: 'file', filename: 'logs/all-the-logs.log' },
      emergencies: { type: 'file', filename: 'logs/error.log' },
       console : {    type: "console" ,layout: {
          type: 'pattern',
          pattern: '%[[%d{dd-MM-yyyy hh:mm:ss.SSS}] [%p] %c -%] %m',
      }},
      'just-errors': { type: 'logLevelFilter', appender: 'emergencies', level: 'error' }
    },
    categories: {
      default: { appenders: ['just-errors', 'everything','console' ], level: 'debug' }
    }
  });

  var log = log4js.getLogger('API - Handler');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        log.error("Invalid Token : "+ err);  
        return res.status(401).json({ message: 'Invalid Token' });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
}