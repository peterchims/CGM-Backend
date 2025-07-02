// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  countryCode: {
    type: String,
    required: true,
    enum: ['US', 'CA', 'UK', 'NG']
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  orgType: {
    type: String,
    required: [true, 'Organization type is required'],
    enum: ['Church', 'Promoter', 'Non Profit', 'Others']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['Worship Evening', 'Concert', 'Others']
  },
  eventDetails: {
    type: String,
    required: [true, 'Event details are required'],
    minlength: [20, 'Please provide more details (minimum 20 characters)']
  },
  eventDate: {
    day: { type: Number, required: true, min: 1, max: 31 },
    month: { type: String, required: true },
    year: { type: Number, required: true }
  },
  address: {
    address1: { type: String, required: true },
    address2: { type: String, default: '' },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  agreeTerms: {
    type: Boolean,
    required: true,
    default: false,
    validate: {
      validator: (value) => value === true,
      message: 'You must agree to the terms'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);