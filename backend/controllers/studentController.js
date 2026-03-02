const Student = require('../models/Student');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// @desc    Register a student
// @route   POST /api/students
// @access  Private
const registerStudent = async (req, res) => {
    const { name, roll_no } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'At least one photo is required' });
    }

    try {
        const studentExists = await Student.findOne({ roll_no });
        if (studentExists) {
            // cleanup uploaded files
            files.forEach(f => fs.unlinkSync(f.path));
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        let allEncodings = [];
        for (const file of files) {
            try {
                const response = await axios.post(`${process.env.PYTHON_API_URL}/encode`, {
                    image_path: path.resolve(file.path)
                });
                if (response.data && response.data.encoding) {
                    allEncodings.push(response.data.encoding);
                }
            } catch (err) {
                console.error(`Encoding failed for ${file.originalname}:`, err.message);
            }
        }

        // cleanup files
        files.forEach(f => fs.unlinkSync(f.path));

        if (allEncodings.length === 0) {
            return res.status(400).json({ message: 'Failed to detect any faces in the provided images.' });
        }

        // Average the encodings
        const numEncodings = allEncodings.length;
        const configLength = allEncodings[0].length;
        let avgEncoding = new Array(configLength).fill(0);

        for (let i = 0; i < numEncodings; i++) {
            for (let j = 0; j < configLength; j++) {
                avgEncoding[j] += allEncodings[i][j];
            }
        }
        avgEncoding = avgEncoding.map(val => val / numEncodings);

        const student = await Student.create({
            name,
            roll_no,
            face_encoding: avgEncoding,
            registered_by: req.user ? req.user._id : null
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-face_encoding');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerStudent, getStudents };
