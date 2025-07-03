require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const donationRoutes = require('./routes/donationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

app.get('/', (req, res) => {
  res.send('Donation Website Backend is running');
});

app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });