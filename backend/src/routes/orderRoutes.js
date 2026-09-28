const express = require('express');
const router = express.Router();
const { createOrder, getOrderById } = require('../controllers/orderController');

// Public guest order creation
router.post('/', createOrder);

// Order summary view for order confirmation
router.get('/:id', getOrderById);

module.exports = router;
