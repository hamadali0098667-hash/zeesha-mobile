const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, isManager, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProducts).post(protect, isManager, createProduct);
router.route('/:id').put(protect, isManager, updateProduct).delete(protect, isAdmin, deleteProduct);

module.exports = router;