const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    confirmationId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    userEmail: { type: String },
    paymentMethod: { type: String, enum: ["zelle", "paypal"], required: true },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "failed"], 
      default: "pending" 
    },
    metadata: { type: Object }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ confirmationId: 1 }, { unique: true });

// Virtual for formatted amount
paymentSchema.virtual('amountFormatted').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
module.exports = Payment;