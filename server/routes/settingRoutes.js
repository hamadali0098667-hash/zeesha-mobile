const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getSettings).put(protect, isAdmin, updateSettings);
module.exports = router;