const Donor = require('../models/Donor');
const nodemailer = require('nodemailer');
const axios = require('axios');
// Placeholder for Chapa integration (replace with actual Chapa SDK or API calls)

// Configure Nodemailer transporter (update with real credentials in .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendThankYouEmail(donor) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: donor.email,
    subject: 'Thank You for Your Donation!',
    text: `Dear ${donor.name},\n\nThank you for your generous donation of $${donor.amount}.\n\nBest regards,\nDonation Foundation Team`
  };
  await transporter.sendMail(mailOptions);
}

exports.createPayment = async (req, res) => {
  try {
    const { name, email, amount, paymentType, isCompany, companyName } = req.body;
    // Generate a unique transaction reference
    const tx_ref = 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    // Prepare Chapa payment payload
    const chapaPayload = {
      amount: amount,
      currency: 'ETB',
      email: email,
      first_name: name,
      tx_ref: tx_ref,
      callback_url: process.env.CHAPA_CALLBACK_URL || 'http://localhost:3000/payment/callback',
      return_url: process.env.CHAPA_RETURN_URL || 'http://localhost:3000/payment/success',
      customization: {
        title: 'Donation Payment',
        description: 'Donation to Foundation',
      },
    };
    // Call Chapa API to initialize payment
    const chapaRes = await axios.post('https://api.chapa.co/v1/transaction/initialize', chapaPayload, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (chapaRes.data && chapaRes.data.status === 'success') {
      // Save donor info (optionally, only after payment verification)
      const donor = new Donor({ name, email, amount, paymentType, isCompany, companyName });
      await donor.save();
      await sendThankYouEmail(donor);
      res.status(201).json({ message: 'Donation initialized', donor, checkout_url: chapaRes.data.data.checkout_url });
    } else {
      res.status(400).json({ error: 'Failed to initialize payment with Chapa.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getMembers = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};