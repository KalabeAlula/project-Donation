/**
 * Environment-specific configuration
 * Centralizes all configuration variables based on environment
 */

const env = process.env.NODE_ENV || "development";

// Base configuration shared across all environments
const baseConfig = {
  app: {
    port: process.env.PORT || 5000,
    env,
  },
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/donation-website",
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    adminEmail: process.env.ADMIN_EMAIL,
  },
  payment: {
    chapa: {
      secretKey: process.env.CHAPA_SECRET_KEY,
      callbackUrl: process.env.CHAPA_CALLBACK_URL,
      returnUrl: process.env.CHAPA_RETURN_URL,
    },
  },
  urls: {
    backend: process.env.BACKEND_URL || "http://localhost:5000",
    frontend: process.env.FRONTEND_URL || "http://localhost:5174",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours in seconds
  },
};

// Environment-specific configurations
const envConfigs = {
  development: {
    app: {
      ...baseConfig.app,
    },
    mongo: {
      ...baseConfig.mongo,
      // Add development-specific MongoDB options if needed
    },
    cors: {
      ...baseConfig.cors,
      // Allow all origins in development for easier testing
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://frontenddonation-6wkgjxvwz-kaleab-alulas-projects.vercel.app',
        'https://frontenddonation-gh41eones-kaleab-alulas-projects.vercel.app',
        process.env.FRONTEND_URL,
        ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
      ],
    },
  },
  test: {
    app: {
      ...baseConfig.app,
      port: 5001, // Use a different port for testing
    },
    mongo: {
      ...baseConfig.mongo,
      uri: process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/donation-website-test',
    },
    cors: {
      ...baseConfig.cors,
      // Allow all origins in test environment
      origin: '*',
    },
  },
  production: {
    app: {
      ...baseConfig.app,
    },
    mongo: {
      ...baseConfig.mongo,
      options: {
        ...baseConfig.mongo.options,
        // Add production-specific MongoDB options
        socketTimeoutMS: 60000, // Longer timeout for production
        // Add connection pooling options
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
      },
    },
    cors: {
      ...baseConfig.cors,
      // In production, restrict CORS to specific origins
      origin: (origin, callback) => {
        const allowedOrigins = [
          'https://gidf.org.et',                // Production domain
          'https://www.gidf.org.et',            // Production domain with www
          'https://frontenddonation.vercel.app', // Main frontend domain
          'https://frontenddonation-6wkgjxvwz-kaleab-alulas-projects.vercel.app', // Vercel frontend
          'https://frontenddonation-gh41eones-kaleab-alulas-projects.vercel.app',
          process.env.FRONTEND_URL,            // From environment variable
          ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []), // Additional allowed origin
        ];

        // Enable CORS for specific origins in production
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Check if preview mode is enabled for development/testing
          if (process.env.ENABLE_PREVIEW_CORS === "true") {
            callback(null, true);
          } else {
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
          }
        }
      },
    },
    // Add other production-specific configurations
  },
};

// Export the configuration for the current environment
module.exports = {
  ...baseConfig,
  ...(envConfigs[env] || envConfigs.development),
};
