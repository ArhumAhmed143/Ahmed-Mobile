const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getFeaturedHighlight,
  toggleFeaturedHighlight,
  getNewArrivals,
  getBestSellers,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  updateProductDeal,
  deleteProduct,
  deleteProductImage
} = require('../controllers/productController');

const { verifyAdminToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Read Routes
router.get('/featured', getFeaturedProducts);
router.get('/featured-highlight', getFeaturedHighlight);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Admin Mutation Routes (Require JWT Authorization)
router.post('/', verifyAdminToken, upload.array('images', 5), createProduct);
router.put('/:id/featured-highlight', verifyAdminToken, toggleFeaturedHighlight);
router.put('/:id/deal', verifyAdminToken, updateProductDeal);
router.put('/:id', verifyAdminToken, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyAdminToken, deleteProduct);
router.delete('/:productId/images/:imageId', verifyAdminToken, deleteProductImage);

module.exports = router;
