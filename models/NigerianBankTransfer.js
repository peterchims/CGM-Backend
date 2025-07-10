const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, 'Reference is required'],
    unique: true,
    trim: true,
    minlength: [10, 'Reference must be 10 characters'],
    maxlength: [10, 'Reference must be 10 characters']
  },
  senderName: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN',
    enum: ['NGN', 'USD']
  },
  slipFile: {
    data: Buffer,
    contentType: String
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  },
  validatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster duplicate checks
transferSchema.index({ reference: 1 }, { unique: true });

module.exports = mongoose.model('NigerianBankTransfer', transferSchema);