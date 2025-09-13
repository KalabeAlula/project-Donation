const express = require('express');
const router = express.Router();
const { createDonation, getDonations, verifyPayment, verifyChapa, verifyArifpay } = require('../controllers/donationController');

// @route   POST /api/donations
// @desc    Create a new donation
router.post('/', createDonation);

// @route   POST /api/donations/verify-arifpay
// @desc    Verify AfriPay payment callback
router.post('/verify-arifpay', verifyArifpay);

// @route   POST /api/donations/verify-chapa
// @desc    Verify Chapa payment callback (deprecated)
router.post('/verify-chapa', verifyChapa);

// @route   PUT /api/donations/:id/verify
// @desc    Verify payment status
router.put('/:id/verify', verifyPayment);

// @route   GET /api/donations
// @desc    Get all donations
router.get('/', getDonations);

module.exports = router;