const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats — All authenticated roles can access
router.get('/stats', authMiddleware, dashboardController.getStats);

module.exports = router;
