const ApiConfig = require('../models/ApiConfig');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class ApiManager {
  constructor() {
    this.apiCache = new Map();
    this.emailTransporter = null;
    this.alertThresholdDays = 7;
    this.initializeEmailTransporter();
  }

  async initializeEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      await this.emailTransporter.verify();
      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  // Initialize API configurations for different banks
  async initializeBankApis() {
    const bankConfigs = [
      {
        bankName: 'Commercial Bank of Ethiopia',
        apiEndpoint: 'https://api.arifpay.com/v1/cbe',
        apiKey: process.env.CBE_API_KEY,
        apiSecret: process.env.CBE_API_SECRET,
        merchantId: process.env.CBE_MERCHANT_ID,
        expirationDate: new Date('2024-12-31')
      },
      {
        bankName: 'United Bank',
        apiEndpoint: 'https://api.arifpay.com/v1/ub',
        apiKey: process.env.UB_API_KEY,
        apiSecret: process.env.UB_API_SECRET,
        merchantId: process.env.UB_MERCHANT_ID,
        expirationDate: new Date('2024-12-31')
      },
      {
        bankName: 'Awash Bank',
        apiEndpoint: 'https://api.arifpay.com/v1/awash',
        apiKey: process.env.AWASH_API_KEY,
        apiSecret: process.env.AWASH_API_SECRET,
        merchantId: process.env.AWASH_MERCHANT_ID,
        expirationDate: new Date('2024-12-31')
      },
      {
        bankName: 'Dashen Bank',
        apiEndpoint: 'https://api.arifpay.com/v1/dashen',
        apiKey: process.env.DASHEN_API_KEY,
        apiSecret: process.env.DASHEN_API_SECRET,
        merchantId: process.env.DASHEN_MERCHANT_ID,
        expirationDate: new Date('2024-12-31')
      },
      {
        bankName: 'Bank of Abyssinia',
        apiEndpoint: 'https://api.arifpay.com/v1/boa',
        apiKey: process.env.BOA_API_KEY,
        apiSecret: process.env.BOA_API_SECRET,
        merchantId: process.env.BOA_MERCHANT_ID,
        expirationDate: new Date('2024-12-31')
      }
    ];

    try {
      for (const config of bankConfigs) {
        const existingApi = await ApiConfig.findOne({ bankName: config.bankName });
        
        if (!existingApi && config.apiKey && config.apiSecret) {
          await ApiConfig.create(config);
          logger.info(`Initialized API config for ${config.bankName}`);
        }
      }
    } catch (error) {
      logger.error('Error initializing bank APIs:', error);
    }
  }

  // Get active API configuration for a specific bank
  async getApiConfig(bankName) {
    try {
      // Check cache first
      if (this.apiCache.has(bankName)) {
        const cached = this.apiCache.get(bankName);
        if (new Date() - cached.timestamp < 300000) { // 5 minutes cache
          return cached.config;
        }
      }

      const config = await ApiConfig.findOne({ 
        bankName: bankName, 
        isActive: true,
        expirationDate: { $gt: new Date() }
      });

      if (config) {
        // Update usage stats
        config.usageCount += 1;
        config.lastUsedAt = new Date();
        await config.save();

        // Cache the result
        this.apiCache.set(bankName, {
          config: config.toObject(),
          timestamp: new Date()
        });
      }

      return config;
    } catch (error) {
      logger.error(`Error getting API config for ${bankName}:`, error);
      throw error;
    }
  }

  // Get all active API configurations
  async getAllActiveApis() {
    try {
      const configs = await ApiConfig.getActiveApis();
      return configs;
    } catch (error) {
      logger.error('Error getting all active APIs:', error);
      throw error;
    }
  }

  // Update API configuration
  async updateApiConfig(bankName, updates) {
    try {
      const config = await ApiConfig.findOneAndUpdate(
        { bankName },
        { ...updates, updatedAt: Date.now() },
        { new: true }
      );

      // Clear cache
      this.apiCache.delete(bankName);

      return config;
    } catch (error) {
      logger.error(`Error updating API config for ${bankName}:`, error);
      throw error;
    }
  }

  // Renew API credentials
  async renewApiCredentials(bankName, newCredentials) {
    try {
      const config = await ApiConfig.findOneAndUpdate(
        { bankName },
        {
          ...newCredentials,
          lastRenewalDate: new Date(),
          renewalAlertSent: false,
          updatedAt: Date.now()
        },
        { new: true }
      );

      // Clear cache
      this.apiCache.delete(bankName);

      logger.info(`Renewed API credentials for ${bankName}`);
      return config;
    } catch (error) {
      logger.error(`Error renewing API credentials for ${bankName}:`, error);
      throw error;
    }
  }

  // Check for expiring APIs and send alerts
  async checkExpiringApis() {
    try {
      const expiringApis = await ApiConfig.getExpiringApis(this.alertThresholdDays);
      
      for (const api of expiringApis) {
        if (!api.renewalAlertSent) {
          await this.sendRenewalAlert(api);
          api.renewalAlertSent = true;
          await api.save();
        }
      }

      logger.info(`Checked ${expiringApis.length} expiring APIs`);
      return expiringApis;
    } catch (error) {
      logger.error('Error checking expiring APIs:', error);
      throw error;
    }
  }

  // Send renewal alert email
  async sendRenewalAlert(apiConfig) {
    if (!this.emailTransporter) {
      logger.warn('Email transporter not initialized, skipping alert');
      return;
    }

    const daysUntilExpiration = Math.ceil(
      (new Date(apiConfig.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
      subject: `API Renewal Alert: ${apiConfig.bankName} expires in ${daysUntilExpiration} days`,
      html: `
        <h2>API Renewal Required</h2>
        <p>The ArifPay API for <strong>${apiConfig.bankName}</strong> is expiring soon.</p>
        <ul>
          <li><strong>Bank:</strong> ${apiConfig.bankName}</li>
          <li><strong>Expiration Date:</strong> ${apiConfig.expirationDate.toDateString()}</li>
          <li><strong>Days Until Expiration:</strong> ${daysUntilExpiration}</li>
          <li><strong>API Endpoint:</strong> ${apiConfig.apiEndpoint}</li>
        </ul>
        <p>Please renew the API credentials to ensure continuous service availability.</p>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Sent renewal alert for ${apiConfig.bankName}`);
    } catch (error) {
      logger.error(`Failed to send renewal alert for ${apiConfig.bankName}:`, error);
    }
  }

  // Get API usage statistics
  async getUsageStatistics() {
    try {
      const stats = await ApiConfig.aggregate([
        {
          $group: {
            _id: null,
            totalApis: { $sum: 1 },
            activeApis: { $sum: { $cond: [{ $and: [{ $eq: ['$isActive', true] }, { $gt: ['$expirationDate', new Date()] }] }, 1, 0] } },
            expiredApis: { $sum: { $cond: [{ $lt: ['$expirationDate', new Date()] }, 1, 0] } },
            totalUsage: { $sum: '$usageCount' }
          }
        }
      ]);

      const expiringSoon = await ApiConfig.getExpiringApis(this.alertThresholdDays);

      return {
        ...stats[0],
        expiringSoon: expiringSoon.length,
        expiringSoonDetails: expiringSoon.map(api => ({
          bankName: api.bankName,
          expirationDate: api.expirationDate,
          daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
        }))
      };
    } catch (error) {
      logger.error('Error getting usage statistics:', error);
      throw error;
    }
  }

  // Middleware for API authentication and routing
  async apiMiddleware(req, res, next) {
    const { bankName } = req.params;

    try {
      const config = await this.getApiConfig(bankName);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          message: `API configuration not found for bank: ${bankName}`
        });
      }

      // Add API configuration to request object
      req.apiConfig = config;
      next();
    } catch (error) {
      logger.error('API middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Health check for all APIs
  async healthCheck() {
    try {
      const activeApis = await this.getAllActiveApis();
      const results = [];

      for (const api of activeApis) {
        const isHealthy = await this.checkApiHealth(api);
        results.push({
          bankName: api.bankName,
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastUsedAt: api.lastUsedAt,
          usageCount: api.usageCount
        });
      }

      return results;
    } catch (error) {
      logger.error('Error performing health check:', error);
      throw error;
    }
  }

  async checkApiHealth(apiConfig) {
    // Implement actual health check logic here
    // This is a placeholder - you would make a test call to the API
    try {
      // Example health check implementation
      return true;
    } catch (error) {
      logger.error(`Health check failed for ${apiConfig.bankName}:`, error);
      return false;
    }
  }
}

module.exports = new ApiManager();