const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a unique transaction reference for Chapa payments
 * @returns {string} A unique transaction reference
 */
const generateTransactionReference = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(4).toString('hex');
  return `TX-${timestamp}-${randomString}`;
};

/**
 * Initialize a payment with Chapa
 * @param {Object} paymentData - Payment data including amount, email, first_name, etc.
 * @returns {Promise<Object>} - Response from Chapa API
 */
const initializePayment = async (paymentData) => {
  try {
    console.log('Initializing Chapa payment with payload:', paymentData);
    console.log('Using Chapa API URL: https://api.chapa.co/v1/transaction/initialize');
    console.log('Using Chapa secret key:', process.env.CHAPA_SECRET_KEY ? 'Key exists' : 'Key missing');
    
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Chapa API response status:', response.status);
    console.log('Chapa API response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Chapa payment initialization error details:', error.response?.data || error.message);
    console.error('Full error object:', error);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

/**
 * Verify a payment with Chapa
 * @param {string} txRef - Transaction reference
 * @returns {Promise<Object>} - Response from Chapa API
 */
const verifyPayment = async (txRef) => {
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Chapa payment verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

module.exports = {
  generateTransactionReference,
  initializePayment,
  verifyPayment
};