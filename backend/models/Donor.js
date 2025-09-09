const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentType: { type: String, enum: ['one-time', 'monthly'], required: true },
  isCompany: { type: Boolean, default: false },
  companyName: { type: String },
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer', 'arifpay'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  tx_ref: { type: String },
  arifpay_checkout_url: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', donorSchema);