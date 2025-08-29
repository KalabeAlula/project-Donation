const Donor = require("../models/Donor");
const axios = require("axios");
const nodemailer = require("nodemailer");
const chapaUtils = require("../utils/chapaUtils");
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
    if (paymentMethod === "credit_card" || paymentMethod === "chapa") {
      console.log("Processing Chapa payment...");
      // Generate a unique transaction reference
      const tx_ref = chapaUtils.generateTransactionReference();

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      // Prepare Chapa payment payload
      const chapaPayload = {
        amount: amount,
        currency: "ETB",
        email: email,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || name.split(" ")[0],
        tx_ref: tx_ref,
        callback_url:
          process.env.CHAPA_CALLBACK_URL ||
          `${
            process.env.BACKEND_URL || "http://localhost:5000"
          }/api/donations/verify-chapa`,
        return_url:
          process.env.CHAPA_RETURN_URL ||
          `${
            process.env.FRONTEND_URL || "http://localhost:5174"
          }/donation-success`,
        customization: {
          title: "Glory Donation", // Shortened to be under 16 characters
          description: `${
            paymentType === "monthly" ? "Monthly" : "One-time"
          } donation of ${amount} ETB`,
          logo: process.env.LOGO_URL || "",
        },
      };

      logger.info("Chapa payload:", chapaPayload);
      logger.info(
        "Using Chapa secret key:",
        process.env.CHAPA_SECRET_KEY ? "Key exists" : "Key missing"
      );

      try {
        // Call Chapa API to initialize payment using chapaUtils
        logger.info("Calling Chapa API...");
        const chapaResponse = await chapaUtils.initializePayment(chapaPayload);

        logger.info("Chapa API response:", chapaResponse);

        if (chapaResponse && chapaResponse.status === "success") {
          // Create new donor with Chapa payment information
          const donor = await Donor.create({
            name,
            email,
            amount: Number(amount),
            paymentType,
            isCompany: isCompany || false,
            companyName: companyName || "",
            paymentMethod: "chapa",
            paymentStatus: "pending",
            tx_ref: tx_ref,
            chapa_checkout_url: chapaResponse.data.checkout_url,
          });

          logger.info(
            "Donor created successfully with Chapa checkout URL:",
            chapaResponse.data.checkout_url
          );

          res.status(201).json({
            success: true,
            message: "Donation initialized. Please complete payment.",
            data: {
              donor,
              checkout_url: chapaResponse.data.checkout_url,
            },
          });
        } else {
          logger.error("Chapa initialization failed:", chapaResponse);
          res.status(400).json({
            success: false,
            message: "Failed to initialize payment with Chapa.",
            error: chapaResponse,
          });
        }
      } catch (error) {
        logger.error("Chapa API Error:", {
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
      const verificationResult = await chapaUtils.verifyPayment(tx_ref);
      logger.info("Chapa verification result:", verificationResult);

      // Update payment status based on Chapa verification
      donation.paymentStatus =
        verificationResult.status === "success" ? "completed" : "failed";
      donation.transactionId =
        transaction_id ||
        verificationResult.data.transaction_id ||
        donation.transactionId;

      await donation.save();

      // If payment was successful, send thank you email
      if (verificationResult.status === "success") {
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
      logger.error("Error verifying payment with Chapa API:", {
        error: verifyError.message,
        tx_ref,
      });

      // Update based on webhook data if API verification fails
      donation.paymentStatus = status === "success" ? "completed" : "failed";
      donation.transactionId = transaction_id || donation.transactionId;

      await donation.save();

      // If payment was successful based on webhook, send thank you email
      if (status === "success") {
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
            process.env.FRONTEND_URL || "http://localhost:5174"
          }/donation-success?status=${status}&transaction_id=${transaction_id}`
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
    // Check if tx_ref query parameter is provided
    const { tx_ref } = req.query;

    if (tx_ref) {
      // If tx_ref is provided, find donation by tx_ref
      const donation = await Donor.find({ tx_ref });

      return res.status(200).json({
        success: true,
        count: donation.length,
        data: donation,
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
