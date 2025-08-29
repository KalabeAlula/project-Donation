/**
 * Middleware to handle 404 errors for routes that don't exist
 */

const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, 'RESOURCE_NOT_FOUND');
  next(error);
};

module.exports = notFound;