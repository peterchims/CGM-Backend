const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { validateZellePayment } = require("../validators/paymentValidators");

// Confirm Zelle Payment
router.post("/zelle/confirm", async (req, res) => {
  try {
    const { confirmationId, amount, orderId } = req.body;
    
    // Validate input
    const validationError = validateZellePayment({ confirmationId, amount, orderId });
    if (validationError) {
      return res.status(400).json({ 
        success: false,
        error: validationError 
      });
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }

    // Check for duplicate payment
    const existingPayment = await Payment.findOne({ confirmationId });
    if (existingPayment) {
      return res.status(409).json({ 
        success: false,
        error: "This transaction ID has already been used" 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      orderId,
      confirmationId,
      amount,
      paymentMethod: "zelle",
      status: "confirmed",
      userEmail: order.shippingInfo.email,
      metadata: {
        orderDetails: {
          items: order.items,
          shipping: order.shippingInfo
        }
      }
    });

    // Update order status immediately
    await Order.findOneAndUpdate(
      { orderId },
      { 
        $set: { 
          "paymentInfo.zelleConfirmation": confirmationId,
          "paymentInfo.status": "completed",
          status: "completed"
        } 
      }
    );

    return res.json({ 
      success: true, 
      orderId,
      paymentId: payment._id,
      status: "confirmed"
    });

  } catch (err) {
    console.error("❌ Payment confirmation error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Server error processing payment" 
    });
  }
});

// Check Payment Status
router.get("/zelle/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [payment, order] = await Promise.all([
      Payment.findOne({ orderId }),
      Order.findOne({ orderId })
    ]);

    if (!payment || !order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }

    return res.json({ 
      success: true,
      status: payment.status,
      orderStatus: order.status
    });

  } catch (err) {
    console.error("Status check error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Server error checking status" 
    });
  }
});

module.exports = router;