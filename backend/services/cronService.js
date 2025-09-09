const cron = require('node-cron');
const ApiManager = require('./apiManager');
const logger = require('../utils/logger');

class CronService {
  constructor() {
    this.jobs = [];
    this.setupJobs();
  }

  setupJobs() {
    // Check for expiring APIs every day at 9 AM
    this.scheduleDailyExpirationCheck();
    
    // Clean up cache every hour
    this.scheduleHourlyCacheCleanup();
    
    // Log API usage statistics every week
    this.scheduleWeeklyUsageReport();
    
    logger.info('Cron jobs initialized');
  }

  scheduleDailyExpirationCheck() {
    const job = cron.schedule('0 9 * * *', async () => {
      logger.info('Running daily API expiration check...');
      try {
        const expiringApis = await ApiManager.checkExpiringApis();
        
        if (expiringApis.length > 0) {
          logger.warn(`Found ${expiringApis.length} APIs expiring soon`);
          
          // Log details for each expiring API
          expiringApis.forEach(api => {
            const daysUntilExpiration = Math.ceil(
              (api.expirationDate - new Date()) / (1000 * 60 * 60 * 24)
            );
            logger.warn(`API ${api.bankName} expires in ${daysUntilExpiration} days`);
          });
        } else {
          logger.info('No APIs expiring soon');
        }
      } catch (error) {
        logger.error('Error in daily expiration check:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa'
    });

    this.jobs.push({ name: 'daily-expiration-check', job });
  }

  scheduleHourlyCacheCleanup() {
    const job = cron.schedule('0 * * * *', async () => {
      logger.info('Running hourly cache cleanup...');
      try {
        // The cache is automatically managed in ApiManager, but we can add
        // additional cleanup logic here if needed
        logger.info('Cache cleanup completed');
      } catch (error) {
        logger.error('Error in hourly cache cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa'
    });

    this.jobs.push({ name: 'hourly-cache-cleanup', job });
  }

  scheduleWeeklyUsageReport() {
    const job = cron.schedule('0 8 * * 1', async () => {
      logger.info('Running weekly usage report...');
      try {
        const stats = await ApiManager.getUsageStatistics();
        
        logger.info('Weekly API Usage Report:');
        logger.info(`Total APIs: ${stats.totalApis || 0}`);
        logger.info(`Active APIs: ${stats.activeApis || 0}`);
        logger.info(`Expired APIs: ${stats.expiredApis || 0}`);
        logger.info(`Total Usage: ${stats.totalUsage || 0}`);
        
        if (stats.expiringSoon > 0) {
          logger.warn(`APIs expiring soon: ${stats.expiringSoon}`);
          stats.expiringSoonDetails.forEach(api => {
            logger.warn(`  - ${api.bankName}: ${api.daysUntilExpiration} days remaining`);
          });
        }
      } catch (error) {
        logger.error('Error in weekly usage report:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Addis_Ababa'
    });

    this.jobs.push({ name: 'weekly-usage-report', job });
  }

  // Manual trigger for expiration check
  async triggerExpirationCheck() {
    logger.info('Manual expiration check triggered');
    try {
      const expiringApis = await ApiManager.checkExpiringApis();
      
      if (expiringApis.length > 0) {
        logger.warn(`Manual check: ${expiringApis.length} APIs expiring soon`);
        return {
          success: true,
          count: expiringApis.length,
          apis: expiringApis.map(api => ({
            bankName: api.bankName,
            expirationDate: api.expirationDate,
            daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
          }))
        };
      } else {
        logger.info('Manual check: No APIs expiring soon');
        return { success: true, count: 0, apis: [] };
      }
    } catch (error) {
      logger.error('Error in manual expiration check:', error);
      throw error;
    }
  }

  // Get job status
  getJobStatus() {
    return this.jobs.map(job => ({
      name: job.name,
      running: job.job.running,
      nextExecution: job.job.nextDate()
    }));
  }

  // Stop all jobs
  stopAllJobs() {
    this.jobs.forEach(job => {
      job.job.stop();
      logger.info(`Stopped job: ${job.name}`);
    });
  }

  // Start all jobs
  startAllJobs() {
    this.jobs.forEach(job => {
      job.job.start();
      logger.info(`Started job: ${job.name}`);
    });
  }

  // Restart all jobs
  restartAllJobs() {
    this.stopAllJobs();
    this.startAllJobs();
    logger.info('All cron jobs restarted');
  }
}

module.exports = new CronService();