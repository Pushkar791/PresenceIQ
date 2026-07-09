const express = require('express');
const { loginUser, registerUser, googleAuthUser } = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginUser);
router.post('/google', googleAuthUser);
router.post('/register', registerUser);

module.exports = router;
