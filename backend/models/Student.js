const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll_no: { type: String, required: true, unique: true },
    face_encoding: { type: [Number], required: true },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    registered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
