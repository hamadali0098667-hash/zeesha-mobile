const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, getCustomerHistory } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').put(protect, updateCustomer);
router.route('/:id/history').get(protect, getCustomerHistory);

module.exports = router;