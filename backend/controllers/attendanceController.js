const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const axios = require('axios');
const { getImageBase64, cleanupUpload, getPythonApiUrl } = require('../utils/uploadFile');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    const file = req.file;
    const subject = req.body.subject || 'General';
    const pythonApiUrl = getPythonApiUrl();

    if (!file) return res.status(400).json({ message: 'Photo is required' });

    if (!pythonApiUrl) {
        cleanupUpload(file);
        return res.status(503).json({
            message: 'Face recognition service is not configured. Set PYTHON_API_URL on the backend.',
        });
    }

    try {
        const response = await axios.post(`${pythonApiUrl}/recognize`, {
            image_b64: getImageBase64(file),
        }, { timeout: 30000 });

        cleanupUpload(file);

        if (!response.data?.encoding) {
            return res.status(400).json({ message: 'No face detected in the image' });
        }

        const unknownEncoding = response.data.encoding;
        const students = await Student.find({ status: 'Active' });

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students registered' });
        }

        let matchedStudent = null;
        let minDistance = 100;

        for (const student of students) {
            const storedEncoding = student.face_encoding;
            const distance = Math.sqrt(
                storedEncoding.reduce((sum, val, i) => sum + Math.pow(val - unknownEncoding[i], 2), 0)
            );

            if (distance < 0.85 && distance < minDistance) {
                matchedStudent = student;
                minDistance = distance;
            }
        }

        if (!matchedStudent) {
            return res.status(404).json({ message: 'No matching student found' });
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];

        const existing = await Attendance.findOne({
            student_id: matchedStudent._id,
            date: dateStr,
            subject,
        });

        if (existing) {
            return res.status(400).json({
                message: `Attendance already marked today for ${matchedStudent.name} in ${subject}`,
            });
        }

        const attendance = await Attendance.create({
            student_id: matchedStudent._id,
            date: dateStr,
            time: timeStr,
            subject,
            status: 'Present',
            ip_address: req.ip || req.connection.remoteAddress,
            recorded_by: req.user ? req.user._id : null,
        });

        res.status(201).json({
            message: 'Attendance marked successfully',
            student: { name: matchedStudent.name, roll_no: matchedStudent.roll_no },
            record: attendance,
        });
    } catch (error) {
        cleanupUpload(file);
        console.error('Attendance error:', error);

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({ message: 'Face recognition service is unavailable. Check PYTHON_API_URL.' });
        }

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
