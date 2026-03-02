const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Photo is required' });

    try {
        // 1. Get embedding from Python API
        const response = await axios.post(`${process.env.PYTHON_API_URL}/recognize`, {
            image_path: path.resolve(file.path)
        });

        fs.unlinkSync(file.path); // clean up

        if (!response.data || !response.data.encoding) {
            return res.status(400).json({ message: 'No face detected in the image' });
        }

        const unknownEncoding = response.data.encoding;

        // 2. Fetch all student encodings
        // In production with millions of users, we'd use Annoy or Milvus, but for now DB query is fine.
        const students = await Student.find({ status: 'Active' });

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students registered' });
        }

        let matchedStudent = null;
        let minDistance = 100;

        for (const student of students) {
            const storedEncoding = student.face_encoding;
            // Euclidean distance
            const distance = Math.sqrt(
                storedEncoding.reduce((sum, val, i) => sum + Math.pow(val - unknownEncoding[i], 2), 0)
            );

            if (distance < 0.85 && distance < minDistance) { // Stricter threshold for HOG descriptors
                matchedStudent = student;
                minDistance = distance;
            }
        }

        if (!matchedStudent) {
            return res.status(404).json({ message: 'No matching student found' });
        }

        // 3. Mark attendance
        const now = new Date();
        // Use local time for marking or UTC
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];

        // Optional: Prevent duplicate attendance on the same day
        const existing = await Attendance.findOne({
            student_id: matchedStudent._id,
            date: dateStr
        });

        if (existing) {
            return res.status(400).json({ message: `Attendance already marked today for ${matchedStudent.name}` });
        }

        const attendance = await Attendance.create({
            student_id: matchedStudent._id,
            date: dateStr,
            time: timeStr,
            status: 'Present',
            ip_address: req.ip || req.connection.remoteAddress,
            recorded_by: req.user ? req.user._id : null
        });

        res.status(201).json({
            message: 'Attendance marked successfully',
            student: { name: matchedStudent.name, roll_no: matchedStudent.roll_no },
            record: attendance
        });

    } catch (error) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        console.error('Attendance error:', error);
        res.status(500).json({ message: error.response?.data?.error || error.message });
    }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({}).populate('student_id', 'name roll_no status').sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance };
