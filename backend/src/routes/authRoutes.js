const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public admin login endpoint
router.post('/admin/login', adminLogin);

// Protected admin profile endpoint
router.get('/admin/me', verifyAdminToken, getAdminProfile);

module.exports = router;
