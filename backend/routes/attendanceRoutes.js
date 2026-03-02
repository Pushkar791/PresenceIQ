const express = require('express');
const { markAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, upload.single('photo'), markAttendance)
    .get(protect, getAttendance);

module.exports = router;
