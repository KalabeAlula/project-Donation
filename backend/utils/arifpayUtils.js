const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a unique transaction reference for Arifpay payments
 * @returns {string} A unique transaction reference
 */
const generateTransactionReference = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(4).toString('hex');
  return `TX-${timestamp}-${randomString}`;
};

/**
 * Initialize a payment with Arifpay
 * @param {Object} paymentData - Payment data including amount, email, etc.
 * @returns {Promise<Object>} - Response from Arifpay API
 */
const initializePayment = async (paymentData) => {
  try {
    console.log('Initializing Arifpay payment with payload:', paymentData);
    console.log('Using Arifpay API URL: https://api.arifpay.org/api/checkout/session');
    console.log('Using Arifpay API key:', process.env.ARIFPAY_API_KEY ? 'Key exists' : 'Key missing');
    
    const response = await axios.post(
      'https://api.arifpay.org/api/checkout/session',
      paymentData,
      {
        headers: {
          'x-arifpay-key': process.env.ARIFPAY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Arifpay API response status:', response.status);
    console.log('Arifpay API response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Arifpay payment initialization error details:', error.response?.data || error.message);
    console.error('Full error object:', error);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

/**
 * Verify a payment with Arifpay
 * @param {string} sessionId - Arifpay session ID
 * @returns {Promise<Object>} - Response from Arifpay API
 */
const verifyPayment = async (sessionId) => {
  try {
    const response = await axios.get(
      `https://api.arifpay.org/api/checkout/session/${sessionId}`,
      {
        headers: {
          'x-arifpay-key': process.env.ARIFPAY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Arifpay payment verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

module.exports = {
  generateTransactionReference,
  initializePayment,
  verifyPayment
};