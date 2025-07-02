// server/models/Volunteer.js
const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    role: {
      type: String,
      required: [true, 'Volunteering role is required'],
      enum: ['backup-singer', 'protocol', 'media', 'security', 'Vocalist', 'others'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for volunteering is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Volunteer', VolunteerSchema);
