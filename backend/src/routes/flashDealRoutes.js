const express = require('express');
const router = express.Router();
const {
  getActiveFlashDeals,
  getAllFlashDeals,
  createFlashDeal,
  updateFlashDeal,
  deleteFlashDeal,
  toggleFlashDealStatus
} = require('../controllers/flashDealController');

const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public Active Flash Deals Route
router.get('/active', getActiveFlashDeals);

// Protected Admin Management Routes
router.get('/', verifyAdminToken, getAllFlashDeals);
router.post('/', verifyAdminToken, createFlashDeal);
router.put('/:id', verifyAdminToken, updateFlashDeal);
router.put('/:id/toggle', verifyAdminToken, toggleFlashDealStatus);
router.delete('/:id', verifyAdminToken, deleteFlashDeal);

module.exports = router;
