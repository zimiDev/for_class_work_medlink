const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// POST /api/auth/register — Create a new user (Admin only)
router.post('/register', authMiddleware, authorize('Admin'), authController.register);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', authController.login);

module.exports = router;
