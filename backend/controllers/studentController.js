const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const axios = require('axios');
const { getImageBase64, cleanupUploads, getPythonApiUrl } = require('../utils/uploadFile');

const encodeFace = async (file, pythonApiUrl) => {
    const response = await axios.post(`${pythonApiUrl}/encode`, {
        image_b64: getImageBase64(file),
    }, { timeout: 30000 });

    if (response.data?.encoding) {
        return response.data.encoding;
    }
    return null;
};

const registerStudent = async (req, res) => {
    const { name, roll_no } = req.body;
    const files = req.files;
    const pythonApiUrl = getPythonApiUrl();

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'At least one photo is required' });
    }

    if (!pythonApiUrl) {
        cleanupUploads(files);
        return res.status(503).json({ message: 'Face recognition service is not configured.' });
    }

    try {
        const studentExists = await Student.findOne({ roll_no });
        if (studentExists) {
            cleanupUploads(files);
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        const allEncodings = [];
        for (const file of files) {
            try {
                const encoding = await encodeFace(file, pythonApiUrl);
                if (encoding) allEncodings.push(encoding);
            } catch (err) {
                console.error(`Encoding failed for ${file.originalname}:`, err.response?.data?.error || err.message);
            }
        }

        cleanupUploads(files);

        if (allEncodings.length === 0) {
            return res.status(400).json({ message: 'Failed to detect any faces in the provided images.' });
        }

        const numEncodings = allEncodings.length;
        const configLength = allEncodings[0].length;
        const avgEncoding = new Array(configLength).fill(0);

        for (let i = 0; i < numEncodings; i++) {
            for (let j = 0; j < configLength; j++) {
                avgEncoding[j] += allEncodings[i][j];
            }
        }

        const student = await Student.create({
            name,
            roll_no,
            face_encoding: avgEncoding.map((val) => val / numEncodings),
            registered_by: req.user ? req.user._id : null,
        });

        res.status(201).json(student);
    } catch (error) {
        cleanupUploads(files);
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({ message: 'Face recognition service is unavailable.' });
        }
        res.status(500).json({ message: error.response?.data?.error || error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-face_encoding');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-face_encoding');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const attendance = await Attendance.find({ student_id: req.params.id }).sort({ date: 1, time: 1 });
        res.json({ student, attendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerStudent, getStudents, getStudentProfile };
