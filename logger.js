var winston = require('winston'),
  CloudWatchTransport = require('winston-aws-cloudwatch');

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true
    })
  ]
});

const cloudwatchConfig = {
  logGroupName: '/aws/lambda/Serverless-api',
  logStreamName: process.env.logStreamName,
  createLogGroup: false,
  createLogStream: true,
  awsConfig: {
    aws_access_key_id:'AKIAVYCDIYBHNF4KZAUF',
    aws_secret_access_key:'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',
    region: 'Mumbai'
  },
  formatLog: function (item) {
    return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
  }
};

logger.level = 3;

if (process.env.NODE_ENV === 'development') logger.add(CloudWatchTransport, cloudwatchConfig);

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

logger.error('Test log');