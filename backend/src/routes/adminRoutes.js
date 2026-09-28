const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateInventoryStock
} = require('../controllers/adminController');

const { verifyAdminToken } = require('../middleware/authMiddleware');

// All Admin Endpoints Require JWT Verification
router.use(verifyAdminToken);

router.get('/stats', getAdminStats);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/inventory/:productId', updateInventoryStock);

module.exports = router;
