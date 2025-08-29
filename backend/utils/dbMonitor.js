/**
 * Database monitoring utility
 * Monitors MongoDB connection status and operation performance
 */

const mongoose = require('mongoose');
const logger = require('./logger');

// Track MongoDB connection status
const monitorDbConnection = () => {
  // Log connection events
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB connection reestablished');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
  });

  // Periodically log connection stats
  setInterval(() => {
    if (mongoose.connection.readyState === 1) { // Connected
      const stats = {
        collections: Object.keys(mongoose.connection.collections).length,
        models: Object.keys(mongoose.connection.models).length,
        readyState: 'connected',
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      };
      
      logger.debug('MongoDB connection stats', stats);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

// Monitor database operations
const monitorDbOperations = () => {
  // Enable mongoose debug mode in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug(`Mongoose: ${collectionName}.${method}`, {
        query: JSON.stringify(query),
        doc: doc ? '...' : null, // Don't log the full document for privacy
      });
    });
  }

  // Add operation time logging middleware to all schemas
  const addOperationTimeLogging = () => {
    // Get all registered models
    const models = mongoose.connection.models;
    
    // For each model, add pre and post hooks to measure operation time
    Object.keys(models).forEach((modelName) => {
      const model = models[modelName];
      
      // Track operation time for common operations
      ['find', 'findOne', 'findById', 'save', 'update', 'updateOne', 'updateMany', 'delete', 'deleteOne', 'deleteMany'].forEach((operation) => {
        // Skip if the operation doesn't exist on this model
        if (!model.schema.pre || typeof model.schema.pre !== 'function') return;
        
        // Add pre-hook to store start time
        model.schema.pre(operation, function() {
          this._startTime = Date.now();
        });
        
        // Add post-hook to calculate and log operation time
        model.schema.post(operation, function(doc, next) {
          if (this._startTime) {
            const operationTime = Date.now() - this._startTime;
            
            // Log slow operations (> 100ms)
            if (operationTime > 100) {
              logger.warn(`Slow DB operation: ${modelName}.${operation} took ${operationTime}ms`, {
                model: modelName,
                operation,
                time: operationTime,
                query: this._conditions ? JSON.stringify(this._conditions) : null,
              });
            }
          }
          next();
        });
      });
    });
  };

  // Add operation time logging after connection is established
  mongoose.connection.once('connected', addOperationTimeLogging);
};

module.exports = {
  monitorDbConnection,
  monitorDbOperations,
};