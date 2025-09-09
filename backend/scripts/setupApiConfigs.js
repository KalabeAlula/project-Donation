const mongoose = require('mongoose');
const ApiConfig = require('../models/ApiConfig');
require('dotenv').config();

const setupApiConfigs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-platform');
    console.log('Connected to MongoDB');

    // Sample bank API configurations for ArifPay integration
    const bankConfigs = [
      {
        bankName: 'Bank of Abyssinia',
        apiEndpoint: 'https://api.bankofabyssinia.com/arifpay',
        apiKey: process.env.BANK_1_API_KEY || 'boa-demo-key-' + Date.now(),
        apiSecret: process.env.BANK_1_SECRET || 'boa-demo-secret',
        expirationDate: new Date('2024-12-31'),
        status: 'active',
        usageLimits: {
          daily: 1000,
          monthly: 30000
        },
        currentUsage: {
          daily: 0,
          monthly: 0
        },
        metadata: {
          bankCode: 'BOA',
          currency: 'ETB',
          country: 'Ethiopia',
          contact: 'support@bankofabyssinia.com'
        }
      },
      {
        bankName: 'Commercial Bank of Ethiopia',
        apiEndpoint: 'https://api.combanketh.com/arifpay',
        apiKey: process.env.BANK_2_API_KEY || 'cbe-demo-key-' + Date.now(),
        apiSecret: process.env.BANK_2_SECRET || 'cbe-demo-secret',
        expirationDate: new Date('2024-12-31'),
        status: 'active',
        usageLimits: {
          daily: 2000,
          monthly: 50000
        },
        currentUsage: {
          daily: 0,
          monthly: 0
        },
        metadata: {
          bankCode: 'CBE',
          currency: 'ETB',
          country: 'Ethiopia',
          contact: 'support@combanketh.com'
        }
      },
      {
        bankName: 'Awash Bank',
        apiEndpoint: 'https://api.awashbank.com/arifpay',
        apiKey: process.env.BANK_3_API_KEY || 'awash-demo-key-' + Date.now(),
        apiSecret: process.env.BANK_3_SECRET || 'awash-demo-secret',
        expirationDate: new Date('2024-12-31'),
        status: 'active',
        usageLimits: {
          daily: 1500,
          monthly: 40000
        },
        currentUsage: {
          daily: 0,
          monthly: 0
        },
        metadata: {
          bankCode: 'AWASH',
          currency: 'ETB',
          country: 'Ethiopia',
          contact: 'support@awashbank.com'
        }
      },
      {
        bankName: 'Dashen Bank',
        apiEndpoint: 'https://api.dashenbank.com/arifpay',
        apiKey: process.env.BANK_4_API_KEY || 'dashen-demo-key-' + Date.now(),
        apiSecret: process.env.BANK_4_SECRET || 'dashen-demo-secret',
        expirationDate: new Date('2024-12-31'),
        status: 'active',
        usageLimits: {
          daily: 1200,
          monthly: 35000
        },
        currentUsage: {
          daily: 0,
          monthly: 0
        },
        metadata: {
          bankCode: 'DASHEN',
          currency: 'ETB',
          country: 'Ethiopia',
          contact: 'support@dashenbank.com'
        }
      },
      {
        bankName: 'Wegagen Bank',
        apiEndpoint: 'https://api.wegagenbank.com/arifpay',
        apiKey: process.env.BANK_5_API_KEY || 'wegagen-demo-key-' + Date.now(),
        apiSecret: process.env.BANK_5_SECRET || 'wegagen-demo-secret',
        expirationDate: new Date('2024-12-31'),
        status: 'active',
        usageLimits: {
          daily: 1000,
          monthly: 25000
        },
        currentUsage: {
          daily: 0,
          monthly: 0
        },
        metadata: {
          bankCode: 'WEGAGEN',
          currency: 'ETB',
          country: 'Ethiopia',
          contact: 'support@wegagenbank.com'
        }
      }
    ];

    // Clear existing configurations
    await ApiConfig.deleteMany({});
    console.log('Cleared existing API configurations');

    // Insert new configurations
    const insertedConfigs = await ApiConfig.insertMany(bankConfigs);
    console.log(`Inserted ${insertedConfigs.length} API configurations`);

    // Display summary
    console.log('\n=== API Configuration Summary ===');
    insertedConfigs.forEach(config => {
      console.log(`- ${config.bankName}: ${config.status} (expires: ${config.expirationDate.toDateString()})`);
    });

    console.log('\n=== Next Steps ===');
    console.log('1. Update your .env file with actual API keys');
    console.log('2. Run: npm install node-cron');
    console.log('3. Start your server: npm run dev');
    console.log('4. Check API status at: GET /api/api-configs');

  } catch (error) {
    console.error('Error setting up API configurations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run setup if called directly
if (require.main === module) {
  setupApiConfigs();
}

module.exports = setupApiConfigs;