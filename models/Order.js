const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  shippingInfo: {
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    email: String,
    phone: String
  },
  paymentInfo: {
    method: String,
    status: { type: String, default: 'pending' },
    zelleConfirmation: String,
    paypalPaymentId: String
  },
  status: { type: String, default: 'pending' },
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;