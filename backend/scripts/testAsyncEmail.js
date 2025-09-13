require('dotenv').config({ path: 'd:\\projects\\MERN stack\\project\\backend\\.env' });
const axios = require('axios');
const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const { createDonation } = require('../controllers/donationController');

// Mock request and response objects
const req = {
    body: {
        name: 'Test Donor',
        email: 'test@example.com',
        amount: 100,
        paymentType: 'one-time',
        paymentMethod: 'bank_transfer',
    },
};

const res = {
    status: (code) => {
        console.log(`Status code: ${code}`);
        return res;
    },
    json: (data) => {
        console.log('Response data:', data);
    },
};

// Connect to the database and run the test
const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        console.log('Running test...');
        await createDonation(req, res);

        // Disconnect from the database
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('Test failed:', error);
    }
};

runTest();