const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for the application
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get system information
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const cpuUsage = os.loadavg()[0]; // 1 minute load average
    
    // Get Node.js information
    const nodeVersion = process.version;
    const environment = process.env.NODE_ENV;
    
    // Prepare health status response
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'donation-api',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        name: 'MongoDB'
      },
      system: {
        uptime: `${Math.floor(uptime / 60 / 60)} hours, ${Math.floor(uptime / 60) % 60} minutes`,
        memory: {
          free: `${Math.round(freeMemory / 1024 / 1024)} MB`,
          total: `${Math.round(totalMemory / 1024 / 1024)} MB`,
          used: `${Math.round((totalMemory - freeMemory) / 1024 / 1024)} MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
        },
        cpu: {
          loadAverage: cpuUsage
        }
      },
      environment: {
        node: nodeVersion,
        env: environment
      }
    };
    
    // Log health check
    logger.info(`Health check performed: ${healthStatus.status}`);
    
    return res.status(200).json(healthStatus);
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;