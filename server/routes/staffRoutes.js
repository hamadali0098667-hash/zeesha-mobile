const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff } = require('../controllers/staffController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, isAdmin, getStaff).post(protect, isAdmin, createStaff);
router.route('/:id').put(protect, isAdmin, updateStaff);

module.exports = router;