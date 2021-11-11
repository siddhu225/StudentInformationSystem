const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentid: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
  },
  mark1: {
    type: Number,
  },
  mark2: {
    type: Number,
  },
  mark3: {
    type: Number,
  },
}, {
  timestamps: true
});

studentSchema.index({ 'studentid': 1 });

const StudentModel = mongoose.model('student', studentSchema);

module.exports = StudentModel;
