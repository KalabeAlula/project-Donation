/**
 * Performance monitoring middleware
 * Tracks API response times and resource usage
 */

const responseTime = require('response-time');
const logger = require('../utils/logger');

// Track memory usage
const trackMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  return {
    rss: Math.round(memoryUsage.rss / 1024 / 1024), // Resident Set Size in MB
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // Total Heap Size in MB
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // Used Heap Size in MB
    external: Math.round(memoryUsage.external / 1024 / 1024), // External memory in MB
  };
};

// Log slow responses
const logSlowResponses = (req, res, time) => {
  // Define threshold for slow responses (in ms)
  const SLOW_THRESHOLD = 1000; // 1 second
  
  if (time > SLOW_THRESHOLD) {
    logger.warn(`Slow response detected: ${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`, {
      method: req.method,
      url: req.originalUrl,
      responseTime: time,
      userId: req.user ? req.user.id : null,
      userAgent: req.headers['user-agent'],
      memoryUsage: trackMemoryUsage(),
    });
  }
};

// Performance monitoring middleware
const performanceMonitor = responseTime((req, res, time) => {
  // Log all response times in debug level
  logger.debug(`${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`);
  
  // Log slow responses with more details
  logSlowResponses(req, res, time);
  
  // Add response time to response headers
  res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
});

// Periodically log system resources
const startResourceMonitoring = (interval = 5 * 60 * 1000) => { // Default: every 5 minutes
  setInterval(() => {
    const memoryUsage = trackMemoryUsage();
    logger.info('System resource usage', {
      memoryUsage,
      uptime: Math.round(process.uptime() / 60), // Uptime in minutes
      cpuUsage: process.cpuUsage(),
    });
  }, interval);
};

module.exports = {
  performanceMonitor,
  startResourceMonitoring,
};