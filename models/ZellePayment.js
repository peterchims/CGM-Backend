const mongoose = require('mongoose');

const ZellePaymentSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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

module.exports = mongoose.model('ZellePayment', ZellePaymentSchema);