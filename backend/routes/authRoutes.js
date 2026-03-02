const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginUser);
// Initial setup: maybe allow public registration first, or insert script. For now, public to create first admin.
// In production, registerUser should be guarded by protect, admin
router.post('/register', registerUser);

module.exports = router;
