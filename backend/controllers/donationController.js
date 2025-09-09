const Donor = require("../models/Donor");
const axios = require("axios");
const nodemailer = require("nodemailer");
const arifpayUtils = require("../utils/arifpayUtils");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send thank you email to donor
async function sendThankYouEmail(donor) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: "Thank You for Your Donation!",
      text: `Dear ${donor.name},\n\nThank you for your generous donation of $${donor.amount}.\n\nBest regards,\nGlory Integrated Development Foundation Team`,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Thank you email sent to ${donor.email}`);
  } catch (error) {
    logger.error("Error sending thank you email:", {
      error: error.message,
      donorEmail: donor.email,
    });
  }
}

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
      console.log("Processing ArifPay payment...");
      // Generate a unique transaction reference
      const sessionId = arifpayUtils.generateTransactionReference();

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      // Prepare ArifPay payment payload
      const arifpayPayload = {
        cancelUrl: `${process.env.FRONTEND_URL || "https://gidf.org.et"}/donation-success`,
        successUrl: `${process.env.FRONTEND_URL || "https://gidf.org.et"}/donation-success?sessionId=${sessionId}`,
        errorUrl: `${process.env.FRONTEND_URL || "https://gidf.org.et"}/donation-success`,
        notifyUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/donations/verify-arifpay`,
        paymentMethods: ["CARD"],
        items: [{
          name: "Glory Donation",
          quantity: 1,
          price: Number(amount),
          description: `${paymentType === "monthly" ? "Monthly" : "One-time"} donation of ${amount} ETB`
        }],
        beneficiaries: [{
          accountNumber: "123456789",
          bank: "ABYSSINIA",
          amount: Number(amount)
        }],
        expiresIn: 3600
      };

      logger.info("ArifPay payload:", arifpayPayload);
      logger.info(
        "Using ArifPay API key:",
        process.env.ARIFPAY_API_KEY ? "Key exists" : "Key missing"
      );

      try {
        // Call ArifPay API to initialize payment using arifpayUtils
        logger.info("Calling ArifPay API...");
        const arifpayResponse = await arifpayUtils.initializePayment(arifpayPayload);

        logger.info("ArifPay API response:", arifpayResponse);

        if (arifpayResponse && arifpayResponse.sessionId) {
          // Create new donor with ArifPay payment information
          const donor = await Donor.create({
            name,
            email,
            amount: Number(amount),
            paymentType,
            isCompany: isCompany || false,
            companyName: companyName || "",
            paymentMethod: "arifpay",
            paymentStatus: "pending",
            sessionId: sessionId,
            arifpay_checkout_url: arifpayResponse.paymentUrl,
          });

          logger.info(
            "Donor created successfully with ArifPay checkout URL:",
            arifpayResponse.paymentUrl
          );

          res.status(201).json({
            success: true,
            message: "Donation initialized. Please complete payment.",
            data: {
              donor,
              checkout_url: arifpayResponse.paymentUrl.trim(),
            },
          });
        } else {
          logger.error("ArifPay initialization failed:", arifpayResponse);
          res.status(400).json({
            success: false,
            message: "Failed to initialize payment with ArifPay.",
            error: arifpayResponse,
          });
        }
      } catch (error) {
        logger.error("ArifPay API Error:", {
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

      // Send thank you email for bank transfer
      try {
        await sendThankYouEmail(donor);
      } catch (emailErr) {
        logger.error("Error sending thank you email:", {
          error: emailErr.message,
          donorEmail: donor.email,
        });
      }

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

      // Send thank you email
      try {
        await sendThankYouEmail(donor);
      } catch (emailErr) {
        logger.error("Error sending thank you email:", {
          error: emailErr.message,
          donorEmail: donor.email,
        });
      }

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

// @desc    Verify ArifPay payment callback
// @route   POST /api/donations/verify-arifpay
// @access  Public
exports.verifyArifpay = async (req, res) => {
  try {
    const { sessionId, status } = req.body;

    logger.info("Received ArifPay webhook:", req.body);

    // Find the donation by sessionId
    const donation = await Donor.findOne({ sessionId });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Verify the payment status with ArifPay API
    try {
      const verificationResult = await arifpayUtils.verifyPayment(sessionId);
      logger.info("ArifPay verification result:", verificationResult);

      // Update payment status based on ArifPay verification
      donation.paymentStatus =
        verificationResult.status === "PAID" ? "completed" : "failed";
      donation.transactionId =
        verificationResult.transactionId || donation.transactionId;

      await donation.save();

      // If payment was successful, send thank you email
      if (verificationResult.status === "PAID") {
        try {
          await sendThankYouEmail(donation);
        } catch (emailErr) {
          logger.error("Error sending thank you email:", {
            error: emailErr.message,
            donorEmail: donation.email,
          });
        }
      }

      // Respond with JSON
      return res.status(200).json({
        success: true,
        message: "Payment verification processed",
        data: donation,
      });
    } catch (verifyError) {
      logger.error("Error verifying payment with ArifPay API:", {
        error: verifyError.message,
        sessionId,
      });

      // Update based on webhook data if API verification fails
      donation.paymentStatus = status === "PAID" ? "completed" : "failed";
      donation.transactionId = donation.transactionId;

      await donation.save();

      // If payment was successful based on webhook, send thank you email
      if (status === "PAID") {
        try {
          await sendThankYouEmail(donation);
        } catch (emailErr) {
          logger.error("Error sending thank you email:", {
            error: emailErr.message,
            donorEmail: donation.email,
          });
        }
      }

      // Redirect to frontend or respond with JSON
      if (req.query.redirect === "true") {
        return res.redirect(
          `${
            process.env.FRONTEND_URL || "https://gidf.org.et"
          }/donation-success?status=${status}&sessionId=${sessionId}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Payment verification processed based on webhook data",
        data: donation,
      });
    }
  } catch (error) {
    logger.error("Error processing ArifPay webhook:", {
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

    // If payment was marked as completed, send thank you email
    if (
      paymentStatus === "completed" &&
      donation.paymentStatus !== "completed"
    ) {
      try {
        await sendThankYouEmail(donation);
      } catch (emailErr) {
        logger.error("Error sending thank you email:", {
          error: emailErr.message,
          donorEmail: donation.email,
        });
      }
    }

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
    const { sessionId, tx_ref, transactionId, transaction_id } = req.query;

    // Build query based on provided parameters
    let query = {};
    
    if (sessionId) {
      query.sessionId = sessionId;
    } else if (tx_ref) {
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
