const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getDashboardStats);

module.exports = router;