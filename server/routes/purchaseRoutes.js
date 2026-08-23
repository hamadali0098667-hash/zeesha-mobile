const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase } = require('../controllers/purchaseController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getPurchases).post(protect, isManager, createPurchase);

module.exports = router;