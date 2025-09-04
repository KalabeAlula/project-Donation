const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const chapaUtils = require('../utils/chapaUtils');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Migration function to populate tx_ref for existing donations
const migrateTxRef = async () => {
  try {
    console.log('Starting tx_ref migration...');
    
    // Find all donations that don't have tx_ref but have transactionId
    const donationsWithoutTxRef = await Donor.find({
      tx_ref: { $exists: false },
      transactionId: { $exists: true, $ne: null }
    });

    console.log(`Found ${donationsWithoutTxRef.length} donations without tx_ref`);

    let updatedCount = 0;

    for (const donation of donationsWithoutTxRef) {
      // Generate a tx_ref based on existing transactionId or create a new one
      const tx_ref = donation.transactionId.startsWith('txn_') 
        ? donation.transactionId.replace('txn_', 'CHAPA-TX-')
        : `CHAPA-TX-${donation.transactionId}`;

      donation.tx_ref = tx_ref;
      await donation.save();
      updatedCount++;
      console.log(`Updated donation ${donation._id} with tx_ref: ${tx_ref}`);
    }

    // Also handle donations that have neither tx_ref nor transactionId
    const donationsWithoutBoth = await Donor.find({
      tx_ref: { $exists: false },
      $or: [
        { transactionId: { $exists: false } },
        { transactionId: null }
      ]
    });

    console.log(`Found ${donationsWithoutBoth.length} donations without both tx_ref and transactionId`);

    for (const donation of donationsWithoutBoth) {
      // Generate a tx_ref based on donation ID and timestamp
      const tx_ref = `CHAPA-TX-${donation._id.toString().slice(-8)}-${Date.now()}`;
      
      donation.tx_ref = tx_ref;
      donation.transactionId = `txn_${donation._id.toString().slice(-8)}`;
      await donation.save();
      updatedCount++;
      console.log(`Updated donation ${donation._id} with tx_ref: ${tx_ref}`);
    }

    console.log(`Migration completed. Updated ${updatedCount} donations.`);
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// Run migration
connectDB().then(() => migrateTxRef());