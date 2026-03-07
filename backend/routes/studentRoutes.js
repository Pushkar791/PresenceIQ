const express = require('express');
const { registerStudent, getStudents, getStudentProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, upload.array('photos', 5), registerStudent)
    .get(protect, getStudents);

router.route('/:id')
    .get(protect, getStudentProfile);

module.exports = router;
