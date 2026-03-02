const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM:SS
    status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip_address: { type: String },
    geolocation: { type: String },
    liveness_score: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
