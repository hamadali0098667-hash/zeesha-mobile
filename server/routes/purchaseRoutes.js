const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase, updatePurchase, deletePurchase } = require('../controllers/purchaseController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getPurchases).post(protect, isManager, createPurchase);

router.route('/:id').put(protect, isManager, updatePurchase).delete(protect, isManager, deletePurchase);
module.exports = router;
