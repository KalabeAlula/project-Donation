const Donor = require("../models/Donor");
const axios = require("axios");
const arifpayUtils = require("../utils/arifpayUtils");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
exports.createDonation = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      amount,
      paymentType,
      isCompany,
      companyName,
      paymentMethod,
    } = req.body;

    console.log("Received donation request:", {
      name,
      email,
      amount,
      paymentType,
      paymentMethod,
    });

    // Validate required fields
    if (!name || !email || !amount || !paymentType || !paymentMethod) {
      throw new AppError(
        "Please provide all required fields",
        400,
        "VALIDATION_ERROR"
      );
    }

    // Handle different payment methods
    if (paymentMethod === "credit_card" || paymentMethod === "arifpay") {
      console.log("Processing AfriPay payment...");
      // Generate a unique transaction reference
      const tx_ref = arifpayUtils.generateTransactionReference();

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      // Prepare AfriPay payment payload
      const arifpayPayload = {
        amount: amount,
        currency: "ETB",
        email: email,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || name.split(" ")[0],
        tx_ref: tx_ref,
        callback_url:
          process.env.ARIFPAY_CALLBACK_URL ||
          `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/api/donations/verify-arifpay`,
        return_url:
          process.env.ARIFPAY_RETURN_URL ||
          `${
            process.env.FRONTEND_URL || "https://gidf.org.et"
          }/donation-success?tx_ref=${tx_ref}`,
        customization: {
          title: "Glory Donation",
          description: `${
            paymentType === "monthly" ? "Monthly" : "One-time"
          } donation of ${amount} ETB`,
          logo: process.env.LOGO_URL || "",
        },
      };

      logger.info("AfriPay payload:", arifpayPayload);
      logger.info(
        "Using AfriPay secret key:",
        process.env.ARIFPAY_SECRET_KEY ? "Key exists" : "Key missing"
      );

      try {
        // Call AfriPay API to initialize payment using arifpayUtils
        logger.info("Calling AfriPay API...");
        const arifpayResponse = await arifpayUtils.initializePayment(arifpayPayload);

        logger.info("AfriPay API response:", arifpayResponse);

        if (arifpayResponse && arifpayResponse.status === "success") {
          // Create new donor with AfriPay payment information
          const donor = await Donor.create({
            name,
            email,
            amount: Number(amount),
            paymentType,
            isCompany: isCompany || false,
            companyName: companyName || "",
            paymentMethod: "arifpay",
            paymentStatus: "pending",
            tx_ref: tx_ref,
            checkout_url: arifpayResponse.data.checkout_url,
          });

          logger.info(
            "Donor created successfully with AfriPay checkout URL:",
            arifpayResponse.data.checkout_url
          );

          res.status(201).json({
            success: true,
            message: "Donation initialized. Please complete payment.",
            data: {
              donor,
              checkout_url: arifpayResponse.data.checkout_url.trim(),
            },
          });
        } else {
          logger.error("AfriPay initialization failed:", arifpayResponse);
          res.status(400).json({
            success: false,
            message: "Failed to initialize payment with AfriPay.",
            error: arifpayResponse,
          });
        }
      } catch (error) {
        logger.error("AfriPay API Error:", {
          error: error.message,
          stack: error.stack,
        });
        res.status(500).json({
          success: false,
          message: "Error connecting to payment gateway",
          error: error.message,
        });
      }
    } else if (paymentMethod === "bank_transfer") {
      // For bank transfers, simply record the donation as pending
      const donor = await Donor.create({
        name,
        email,
        amount: Number(amount),
        paymentType,
        isCompany: isCompany || false,
        companyName: companyName || "",
        paymentMethod,
        paymentStatus: "pending",
        transactionId: "manual_" + Date.now(),
      });

      res.status(201).json({
        success: true,
        message:
          "Thank you for your donation! Please complete the bank transfer.",
        data: donor,
      });
    } else {
      // This is for backward compatibility or other payment methods
      // Generate a mock transaction ID
      const transactionId =
        "txn_" + Math.random().toString(36).substring(2, 15);

      // Create new donor
      const donor = await Donor.create({
        name,
        email,
        amount: Number(amount),
        paymentType,
        isCompany: isCompany || false,
        companyName: companyName || "",
        paymentMethod,
        paymentStatus: "completed",
        transactionId,
      });

      res.status(201).json({
        success: true,
        message: "Thank you for your donation!",
        data: donor,
      });
    }
  } catch (error) {
    logger.error("Error creating donation:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error processing donation",
      error: error.message,
    });
  }
});

// @desc    Verify Chapa payment callback
// @route   POST /api/donations/verify-chapa
// @access  Public
exports.verifyChapa = async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.body;

    logger.info("Received Chapa webhook:", req.body);

    // Find the donation by tx_ref
    const donation = await Donor.findOne({ tx_ref });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Verify the payment status with Chapa API
    try {
      const verificationResult = await arifpayUtils.verifyPayment(tx_ref);
      logger.info("Chapa verification result:", verificationResult);

      // Update payment status based on Chapa verification
      donation.paymentStatus =
        verificationResult.status === "success" ? "completed" : "failed";
      donation.transactionId =
        transaction_id ||
        verificationResult.data.transaction_id ||
        donation.transactionId;

      await donation.save();

      // Payment verification completed

      // Respond with JSON
      return res.status(200).json({
        success: true,
        message: "Payment verification processed",
        data: donation,
      });
    } catch (verifyError) {
      logger.error("Error verifying payment with Chapa API:", {
        error: verifyError.message,
        tx_ref,
      });

      // Update based on webhook data if API verification fails
      donation.paymentStatus = status === "success" ? "completed" : "failed";
      donation.transactionId = transaction_id || donation.transactionId;

      await donation.save();

      // Payment verification processed based on webhook data

      // Redirect to frontend or respond with JSON
      if (req.query.redirect === "true") {
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "https://gidf.org.et"
          }/donation-success?status=${status}&transaction_id=${transaction_id}&tx_ref=${tx_ref}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verification processed based on webhook data",
        data: donation,
      });
    }
  } catch (error) {
    logger.error("Error processing Chapa webhook:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error processing payment webhook",
      error: error.message,
    });
  }
};

// @desc    Verify AfriPay payment callback
// @route   POST /api/donations/verify-arifpay
// @access  Public
exports.verifyArifpay = async (req, res) => {
  try {
    const { tx_ref, transaction_id, status } = req.body;

    logger.info("Received AfriPay webhook:", {
      tx_ref,
      transaction_id,
      status,
    });

    // Find donation by tx_ref
    const donation = await Donor.findOne({ tx_ref });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Update payment status based on webhook data
    donation.paymentStatus = status === "success" ? "completed" : "failed";
    donation.transactionId = transaction_id || donation.transactionId;

    await donation.save();

    // Payment verification processed

    // Respond with JSON
    res.status(200).json({
      success: true,
      message: "Payment verification processed",
      data: donation,
    });
  } catch (error) {
    logger.error("Error processing AfriPay webhook:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error processing payment webhook",
      error: error.message,
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
        message: "Donation not found",
      });
    }

    // Update payment status
    donation.paymentStatus = paymentStatus || donation.paymentStatus;
    donation.transactionId = transactionId || donation.transactionId;

    await donation.save();

    // Payment status updated successfully

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: donation,
    });
  } catch (error) {
    logger.error("Error verifying payment:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error verifying payment",
      error: error.message,
    });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (would require auth in a real app)
exports.getDonations = async (req, res) => {
  try {
    // Check for query parameters
    const { tx_ref, transactionId, transaction_id } = req.query;

    // Build query based on provided parameters
    let query = {};
    
    if (tx_ref) {
      query.tx_ref = tx_ref;
    } else if (transactionId) {
      query.transactionId = transactionId;
    } else if (transaction_id) {
      query.transactionId = transaction_id;
    }

    if (Object.keys(query).length > 0) {
      // If specific query parameters are provided, find matching donations
      const donations = await Donor.find(query);

      return res.status(200).json({
        success: true,
        count: donations.length,
        data: donations,
      });
    }

    // Otherwise, get all donations
    const donations = await Donor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    logger.error("Error fetching donations:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error fetching donations",
      error: error.message,
    });
  }
};