/**
 * Centralized logging utility
 * Provides consistent logging across the application with different log levels
 */

const winston = require("winston");
const config = require("../config/config");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configure different transports based on environment
const transports = [];

// Always log to console
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ timestamp, level, message, ...meta }) =>
          `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`
      )
    ),
  })
);

// In production, also log to file
if (config.app.env === "production") {
  // Log errors to a separate file
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
    })
  );

  // Log all levels to combined log file
  transports.push(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.app.env === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "donation-api" },
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

module.exports = logger;