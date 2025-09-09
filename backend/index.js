require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const donationRoutes = require('./routes/donationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const apiManagementRoutes = require('./routes/apiManagementRoutes');
const CronService = require('./services/cronService');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const config = require('./config/config');
const applySecurityMiddleware = require('./middleware/security');
const applyRequestLogging = require('./middleware/requestLogger');
const { performanceMonitor, startResourceMonitoring } = require('./middleware/performanceMonitor');
const logger = require('./utils/logger');
const { monitorDbConnection, monitorDbOperations } = require('./utils/dbMonitor');
const { connectDB, closeConnection } = require('./utils/dbConnection');
const setupSwagger = require('./swagger');

// Create logs directory if it doesn't exist and not in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Skip directory creation in serverless environments like Vercel
if (!isServerless) {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir);
      logger.info('Created logs directory');
    } catch (error) {
      logger.warn(`Unable to create logs directory: ${error.message}`);
      // Continue execution even if directory creation fails
    }
  }
}

const app = express();

// Apply request logging middleware (should be first to log all requests)
applyRequestLogging(app);

// Apply performance monitoring middleware
app.use(performanceMonitor);

// Apply security middleware
applySecurityMiddleware(app);

// Apply basic middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Setup Swagger API documentation
setupSwagger(app);

const { port } = config.app;
const { uri: mongoUri, options: mongoOptions } = config.mongo;

app.get('/', (req, res) => {
  res.send(`Donation Website Backend is running in ${config.app.env} mode`);
});
// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api', apiManagementRoutes);

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).send());
app.get('/favicon.png', (req, res) => res.status(204).send());

// Handle 404 errors for routes that don't exist
app.use(notFound);

// Global error handler - must be the last middleware
app.use(errorHandler);

// Set up database monitoring
monitorDbConnection();
monitorDbOperations();

// Connect to MongoDB with optimized connection handling
connectDB()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server running in ${config.app.env} mode on port ${port}`);
      
      // Start resource monitoring in production
      if (config.app.env === 'production') {
        startResourceMonitoring();
        logger.info('Resource monitoring started');
      }
      
      // Initialize cron service for API management
      if (config.app.env !== 'test') {
        CronService.startAllJobs();
        logger.info('Cron service initialized for API management');
      }
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit with failure code
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  // Close server and database connection gracefully
  closeConnection().finally(() => {
    // Give the logger time to process the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  // Close server and database connection gracefully
  closeConnection().finally(() => {
    // Give the logger time to process the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
});

// Handle graceful shutdown on SIGTERM and SIGINT
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  closeConnection().finally(() => {
    logger.info('Process terminated!');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  closeConnection().finally(() => {
    logger.info('Process terminated!');
    process.exit(0);
  });
});