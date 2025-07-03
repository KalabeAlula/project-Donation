const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Route to handle contact form submissions
router.post('/contact', messageController.createMessage);

// Route to get all messages (admin only endpoint)
router.get('/all', messageController.getAllMessages);

module.exports = router;