/**
 * Seed script to insert fake donor data into the database
 * Run with: node backend/scripts/seedDonors.js
 */

const mongoose = require('mongoose');
const Donor = require('../models/Donor');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/donation-app');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Array of fake donor data
const fakeDonors = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    amount: 100,
    paymentType: 'one-time',
    isCompany: false,
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    name: 'Tech Solutions Inc.',
    email: 'donations@techsolutions.com',
    amount: 5000,
    paymentType: 'one-time',
    isCompany: true,
    companyName: 'Tech Solutions Inc.',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    amount: 50,
    paymentType: 'monthly',
    isCompany: false,
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
  },
  {
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    amount: 250,
    paymentType: 'one-time',
    isCompany: false,
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    name: 'Global Charity Foundation',
    email: 'donations@globalcharity.org',
    amount: 10000,
    paymentType: 'one-time',
    isCompany: true,
    companyName: 'Global Charity Foundation',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    amount: 75,
    paymentType: 'one-time',
    isCompany: false,
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    amount: 150,
    paymentType: 'monthly',
    isCompany: false,
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    name: 'Local Business LLC',
    email: 'contact@localbusiness.com',
    amount: 1000,
    paymentType: 'one-time',
    isCompany: true,
    companyName: 'Local Business LLC',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'completed',
    transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
  }
];

// Seed the database with fake donors
const seedDonors = async () => {
  try {
    // Clear existing donors if needed
    await Donor.deleteMany({});
    console.log('Cleared existing donors');
    
    // Insert fake donors
    const donors = await Donor.insertMany(fakeDonors);
    console.log(`Successfully inserted ${donors.length} fake donors`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    console.log('\nTo see the donors in the UI, start your frontend application and navigate to the Recent Donors section.');
  } catch (error) {
    console.error(`Error seeding donors: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeding function
connectDB().then(() => {
  seedDonors();
});