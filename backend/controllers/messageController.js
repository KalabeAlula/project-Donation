const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter (using the same configuration as in paymentController)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send acknowledgment email to the sender
async function sendAcknowledgmentEmail(message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: message.email,
    subject: 'We Received Your Message',
    text: `Dear ${message.name},\n\nThank you for contacting us. We have received your message regarding "${message.subject}".\n\nOur team will review your inquiry and get back to you as soon as possible.\n\nBest regards,\nGlory Integrated Development Foundation Team`
  };
  await transporter.sendMail(mailOptions);
}

// Send notification email to admin
async function sendNotificationToAdmin(message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin email or fallback to sender email
    subject: `New Contact Form Submission: ${message.subject}`,
    text: `New message from ${message.name} (${message.email}):\n\nSubject: ${message.subject}\n\nMessage:\n${message.message}`
  };
  await transporter.sendMail(mailOptions);
}

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Create and save the message
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    
    // Send emails (don't wait for them to complete to avoid delaying response)
    try {
      await sendAcknowledgmentEmail(newMessage);
      await sendNotificationToAdmin(newMessage);
    } catch (emailErr) {
      console.error('Error sending emails:', emailErr);
      // Continue execution even if emails fail
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Your message has been received. Thank you for contacting us!',
      data: newMessage
    });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'An error occurred while processing your message' });
  }
};

// Get all messages (admin only endpoint)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
};