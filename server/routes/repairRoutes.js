const express = require('express');
const router = express.Router();
const { getRepairs, createRepair, updateRepairStatus } = require('../controllers/repairController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRepairs).post(protect, createRepair);
router.route('/:id').put(protect, updateRepairStatus);

module.exports = router;