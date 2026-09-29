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

// ⚠️ IMPORTANT: Apne project ke admin auth middleware ka naam yahan daalo
const { protectAdmin } = require('../middleware/authMiddleware');

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
router.put('/admin/:orderId/verify', protectAdmin, adminVerifyPayment);
router.put('/admin/:orderId/reject', protectAdmin, adminRejectPayment);

module.exports = router;