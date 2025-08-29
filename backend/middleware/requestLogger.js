/**
 * HTTP request logging and performance monitoring middleware
 */

const morgan = require('morgan');
const responseTime = require('response-time');
const logger = require('../utils/logger');
const config = require('../config/config');

// Create a stream object for Morgan that uses our Winston logger
const morganStream = {
  write: (message) => {
    // Remove newline character from Morgan output
    const logMessage = message.trim();
    logger.http(logMessage);
  },
};

// Configure Morgan format based on environment
const morganFormat = config.app.env === 'development' ? 'dev' : 'combined';

// Configure custom request logger middleware
const customRequestLogger = (req, res, next) => {
  // Skip logging in test environment
  if (config.app.env === 'test') {
    return next();
  }
  
  // Add request start time
  req._startTime = new Date();
  
  // Log request details
  const logData = {
    service: 'donation-api',
    environment: config.app.env,
    userId: req.user ? req.user.id : null,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl || req.url,
  };
  
  // Redact sensitive information
  if (req.headers.authorization) {
    logData.authorization = '**REDACTED**';
  }
  
  // Log the request
  logger.info(`Request: ${req.method} ${req.originalUrl || req.url}`, logData);
  
  // Capture the original end function
  const originalEnd = res.end;
  
  // Override the end function to log response
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = new Date() - req._startTime;
    
    // Restore the original end function
    res.end = originalEnd;
    
    // Call the original end function
    res.end(chunk, encoding);
    
    // Log response details
    const responseLogData = {
      responseTime: `${responseTime}ms`,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    };
    
    const logMessage = res.statusCode >= 400
      ? `Response: ${req.method} ${req.originalUrl || req.url} failed with ${res.statusCode}`
      : `Response: ${req.method} ${req.originalUrl || req.url} completed with ${res.statusCode}`;
    
    const logLevel = res.statusCode >= 500 ? 'error' : (res.statusCode >= 400 ? 'warn' : 'info');
    logger[logLevel](logMessage, responseLogData);
  };
  
  next();
};

// Apply request logging and monitoring middleware to Express app
const applyRequestLogging = (app) => {
  // Add response time header (X-Response-Time)
  app.use(responseTime());
  
  // Use Morgan for HTTP request logging
  app.use(morgan(morganFormat, { stream: morganStream }));
  
  // Use custom request logger
  app.use(customRequestLogger);
  
  // Log API requests in development
  if (config.app.env === 'development') {
    app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.originalUrl}`);
      next();
    });
  }
};

module.exports = applyRequestLogging;