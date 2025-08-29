/**
 * Global error handling middleware
 * Centralizes error handling across the application
 */

const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Set default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Structure the error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;