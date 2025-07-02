// controllers/OrderController.js
const Order = require("../models/Order");

const generateOrderId = () => `ORD-${Date.now()}`;

exports.createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const shipping = req.body.shipping;
    const paymentMethod = (req.body.paymentMethod || "").toLowerCase();
    const items = req.body.items;

    // Basic validation
    if (!shipping || Number.isNaN(amount) || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "shipping, amount, and items are required" });
    }
    if (!["zelle","paypal"].includes(paymentMethod)) {
      return res.status(400).json({ error: "paymentMethod must be 'zelle' or 'paypal'" });
    }

    // Validate shipping fields (no zipCode here)
    const requiredKeys = [
      "firstName","lastName","email","phone",
      "address","city","state","nearestLocation","country"
    ];
    const missing = requiredKeys.filter(k => !shipping[k] || shipping[k].trim() === "");
    if (missing.length) {
      return res.status(400).json({ error: `missing shipping fields: ${missing.join(", ")}` });
    }

    // Validate items
    for (const it of items) {
      if (!it.productId || !it.name || typeof it.quantity !== "number" || it.quantity <= 0 ||
          typeof it.price !== "number" || it.price < 0) {
        return res.status(400).json({ error: "Invalid item structure" });
      }
    }

    // Create the order (status: pending)
    const order = await Order.create({
      orderId: generateOrderId(),
      items,
      shippingInfo: shipping,
      paymentInfo: { method: paymentMethod },
      subtotal: amount,
      total: amount,
      status: "pending"
    });

    return res.status(201).json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ error: "Server error creating order" });
  }
};

// controllers/OrderController.js
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, confirmation } = req.body;
    if (!confirmation) {
      return res.status(400).json({ error: "Confirmation details are required" });
    }

    // build update object
    const update = { status: "confirmed" };
    if (paymentMethod === "zelle") {
      update["paymentInfo.zelleConfirmation"] = confirmation;
    } else {
      update["paymentInfo.paypalTxnId"] = confirmation;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: update },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("confirmPayment error:", err);
    return res.status(500).json({ error: "Server error confirming payment" });
  }
};
