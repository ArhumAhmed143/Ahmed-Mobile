const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus
} = require('../controllers/paymentController');

// Public Payment Creation & Status Endpoints
router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;
