const express = require('express');
const router = express.Router();
const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getSuppliers).post(protect, isManager, addSupplier);
router.route('/:id').put(protect, isManager, updateSupplier).delete(protect, isManager, deleteSupplier);

module.exports = router;