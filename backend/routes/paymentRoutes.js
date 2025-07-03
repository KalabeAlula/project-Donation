const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/donate', paymentController.createPayment);
router.get('/members', paymentController.getMembers);

module.exports = router;