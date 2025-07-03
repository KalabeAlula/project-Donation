const Donor = require('../models/Donor');

/**
 * Process payment with the selected payment method
 * This is a mock implementation - in a real app, you would integrate with a payment processor like Stripe, PayPal, etc.
 */
const processPayment = (amount, paymentMethod, transactionId) => {
  // In a real implementation, this would call a payment gateway API
  console.log(`Processing ${amount} payment via ${paymentMethod}, transaction ID: ${transactionId}`);
  
  // Simulate payment processing with 95% success rate
  const isSuccessful = Math.random() < 0.95;
  
  return isSuccessful ? 'completed' : 'failed';
};

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
exports.createDonation = async (req, res) => {
  try {
    const { name, email, amount, paymentType, isCompany, companyName, paymentMethod } = req.body;
    
    // Validate required fields
    if (!name || !email || !amount || !paymentType || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Generate a mock transaction ID (in a real app, this would come from a payment processor)
    const transactionId = 'txn_' + Math.random().toString(36).substring(2, 15);
    
    // Process payment (mock implementation)
    const paymentStatus = processPayment(amount, paymentMethod, transactionId);
    
    // Create new donor with payment information
    const donor = await Donor.create({
      name,
      email,
      amount: Number(amount),
      paymentType,
      isCompany: isCompany || false,
      companyName: companyName || '',
      paymentMethod,
      paymentStatus,
      transactionId
    });

    res.status(201).json({
      success: true,
      message: paymentStatus === 'completed' ? 'Thank you for your donation!' : 'Payment processing is pending.',
      data: donor
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing donation',
      error: error.message
    });
  }
};

// @desc    Verify payment status and update donation
// @route   PUT /api/donations/:id/verify
// @access  Public
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    // Find the donation by ID
    const donation = await Donor.findById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Update payment status
    donation.paymentStatus = paymentStatus || donation.paymentStatus;
    donation.transactionId = transactionId || donation.transactionId;
    
    await donation.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment',
      error: error.message
    });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (would require auth in a real app)
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donor.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donations',
      error: error.message
    });
  }
};