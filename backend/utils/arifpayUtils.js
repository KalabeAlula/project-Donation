const axios = require("axios");
const crypto = require("crypto");

// Configure axios defaults for better SSL handling
const https = require("https");

// Create a custom HTTPS agent with proper SSL configuration
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Ensure SSL verification is enabled
  keepAlive: true,
  timeout: 30000, // 30 second timeout
});

/**
 * Generate a unique transaction reference for AfriPay payments
 * @returns {string} A unique transaction reference
 */
const generateTransactionReference = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(4).toString("hex");
  return `TX-${timestamp}-${randomString}`;
};

/**
 * Initialize a payment with AfriPay
 * @param {Object} paymentData - Payment data including amount, email, etc.
 * @returns {Promise<Object>} - Response from AfriPay API
 */
const initializePayment = async (paymentData) => {
  try {
    // Use environment-based API URL with fallback to production
    const apiUrl =
      process.env.ARIFPAY_API_URL ||
      "https://api.arifpay.com/v1/checkout/session";

    console.log("Initializing AfriPay payment with payload:", paymentData);
    console.log("Using AfriPay API URL:", apiUrl);
    console.log(
      "Using AfriPay secret key:",
      process.env.ARIFPAY_SECRET_KEY ? "Key exists" : "Key missing"
    );

    const response = await axios.post(apiUrl, paymentData, {
      headers: {
        "x-arifpay-key": process.env.ARIFPAY_SECRET_KEY,
        "Content-Type": "application/json",
        "User-Agent": "axios/1.9.0",
      },
      httpsAgent,
      timeout: 30000,
      // Enable certificate validation
      validateStatus: (status) => status >= 200 && status < 300,
    });

    console.log("AfriPay API response status:", response.status);
    console.log("AfriPay API response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("AfriPay payment initialization error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    // Provide more detailed error information
    if (error.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      console.error(
        "SSL Certificate Error: The API endpoint certificate is invalid. Please check ARIFPAY_API_URL configuration."
      );

      // Try fallback URL if available
      const fallbackUrl = "https://arifpay.com/v1/checkout/session";
      console.log("Attempting fallback URL:", fallbackUrl);

      try {
        const fallbackResponse = await axios.post(fallbackUrl, paymentData, {
          headers: {
            "x-arifpay-key": process.env.ARIFPAY_SECRET_KEY,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        });

        console.log("Fallback request successful");
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Fallback request also failed:", fallbackError.message);
      }
    }

    throw new Error(
      error.response?.data?.message ||
        `Failed to initialize payment: ${error.message}`
    );
  }
};

/**
 * Verify a payment with AfriPay
 * @param {string} sessionId - AfriPay session ID
 * @returns {Promise<Object>} - Response from AfriPay API
 */
const verifyPayment = async (sessionId) => {
  try {
    // Use environment-based API URL with fallback to production
    const apiUrl =
      process.env.ARIFPAY_API_URL ||
      "https://api.arifpay.com/v1/checkout/session";

    const response = await axios.get(`${apiUrl}/${sessionId}`, {
      headers: {
        "x-arifpay-key": process.env.ARIFPAY_SECRET_KEY,
        "Content-Type": "application/json",
      },
      httpsAgent,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("AfriPay payment verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.message ||
        `Failed to verify payment: ${error.message}`
    );
  }
};

module.exports = {
  generateTransactionReference,
  initializePayment,
  verifyPayment,
};
