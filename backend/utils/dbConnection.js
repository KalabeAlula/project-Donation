/**
 * Database connection utility
 * Provides optimized MongoDB connection with connection pooling and retry mechanisms
 */

const mongoose = require("mongoose");
const logger = require("./logger");
const config = require("../config/config");

/**
 * Connect to MongoDB with optimized settings and retry mechanism
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection options from config
    const { uri, options } = config.mongo;

    // Define optimized connection options
    const optimizedOptions = {
      ...options,
      // Connection pool settings
      maxPoolSize: process.env.MONGO_MAX_POOL_SIZE || 10,
      minPoolSize: process.env.MONGO_MIN_POOL_SIZE || 5,
      // Timeout settings
      socketTimeoutMS: 45000, // Socket timeout (ms)
      connectTimeoutMS: 10000, // Connection timeout (ms)
      serverSelectionTimeoutMS: 10000, // Server selection timeout (ms)
    };

    // Log connection attempt
    logger.info(
      `Connecting to MongoDB at ${uri.replace(/:([^:@]{4,})@/, ":****@")}`,
      {
        service: "donation-api",
      }
    );
    logger.debug("MongoDB connection options:", {
      ...optimizedOptions,
      service: "donation-api",
    });

    // Connect to MongoDB
    const connection = await mongoose.connect(uri, optimizedOptions);

    // Log successful connection
    logger.info(`MongoDB connected: ${mongoose.connection.host}`, {
      service: "donation-api",
    });

    return connection;
  } catch (error) {
    logger.error("MongoDB connection error:", {
      service: "donation-api",
      error: error.message,
      stack: error.stack,
    });
    // Retry connection with exponential backoff
    return retryConnection();
  }
};

/**
 * Retry MongoDB connection with exponential backoff
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Mongoose connection promise
 */
const retryConnection = async (
  retryCount = 0,
  maxRetries = 5,
  initialDelay = 1000
) => {
  if (retryCount >= maxRetries) {
    logger.error(`Failed to connect to MongoDB after ${maxRetries} retries`, {
      service: "donation-api",
    });
    throw new Error(`Failed to connect to MongoDB after ${maxRetries} retries`);
  }

  // Calculate delay with exponential backoff
  const delay = initialDelay * Math.pow(2, retryCount);

  logger.info(
    `Retrying MongoDB connection in ${delay}ms (attempt ${
      retryCount + 1
    }/${maxRetries})`,
    {
      service: "donation-api",
    }
  );

  // Wait for delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    // Try to connect again
    const { uri, options } = config.mongo;
    const optimizedOptions = {
      ...options,
      maxPoolSize: process.env.MONGO_MAX_POOL_SIZE || 10,
      minPoolSize: process.env.MONGO_MIN_POOL_SIZE || 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    };
    const connection = await mongoose.connect(uri, optimizedOptions);
    logger.info(`MongoDB connected on retry: ${mongoose.connection.host}`, {
      service: "donation-api",
    });
    return connection;
  } catch (error) {
    logger.error("MongoDB connection retry failed:", {
      service: "donation-api",
      error: error.message,
      retryCount,
    });
    // Retry again with incremented count
    return retryConnection(retryCount + 1, maxRetries, initialDelay);
  }
};

/**
 * Close MongoDB connection gracefully
 * @returns {Promise} Promise that resolves when connection is closed
 */
const closeConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Connected
      logger.info("Closing MongoDB connection...", { service: "donation-api" });
      await mongoose.connection.close();
      logger.info("MongoDB connection closed", { service: "donation-api" });
    }
  } catch (error) {
    logger.error("Error closing MongoDB connection:", {
      service: "donation-api",
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  connectDB,
  closeConnection,
};
