const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerHistory } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').put(protect, updateCustomer).delete(protect, deleteCustomer);
router.route('/:id/history').get(protect, getCustomerHistory);

module.exports = router;