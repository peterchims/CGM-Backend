const mongoose = require('mongoose');

const ZellePaymentSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  senderPhone: {
    type: String,
    trim: true,
    set: function(v) {
      // Remove all non-digit characters
      return v.replace(/\D/g, '');
    }
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    minlength: 9,
    maxlength: 9,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add validation for either email or phone being present
ZellePaymentSchema.pre('validate', function(next) {
  if (!this.senderEmail && !this.senderPhone) {
    next(new Error('Either sender email or phone must be provided'));
  } else {
    next();
  }
});

// Add email format validation if email is provided
ZellePaymentSchema.path('senderEmail').validate(function(value) {
  if (value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  return true;
}, 'Invalid email address');

// Add phone format validation if phone is provided
ZellePaymentSchema.path('senderPhone').validate(function(value) {
  if (value) {
    return /^\d{10}$/.test(value);
  }
  return true;
}, 'Invalid phone number (must be 10 digits)');

module.exports = mongoose.model('ZellePayment', ZellePaymentSchema);