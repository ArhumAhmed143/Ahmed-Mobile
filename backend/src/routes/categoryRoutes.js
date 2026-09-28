const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public Read Category Endpoints
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected Admin Category Endpoints
router.post('/', verifyAdminToken, createCategory);
router.put('/:id', verifyAdminToken, updateCategory);
router.delete('/:id', verifyAdminToken, deleteCategory);

module.exports = router;
