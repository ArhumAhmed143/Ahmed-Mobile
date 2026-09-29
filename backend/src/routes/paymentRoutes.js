const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  adminVerifyPayment,
  adminRejectPayment
} = require('../controllers/paymentController');

// ✅ FIX: Aapke project mein middleware ka naam 'verifyAdminToken' hai
const { verifyAdminToken } = require('../middleware/authMiddleware');

// ============================================================
// Public Payment Endpoints (Customer)
// ============================================================
router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/status/:orderId', getPaymentStatus);

// ============================================================
// 🔔 Admin Payment Verification Endpoints (Manual JazzCash/EasyPaisa)
// ============================================================
router.put('/admin/:orderId/verify', verifyAdminToken, adminVerifyPayment);
router.put('/admin/:orderId/reject', verifyAdminToken, adminRejectPayment);

module.exports = router;