// routes/orderRoutes.js
const express    = require("express");
const router     = express.Router();
const orderCtrl  = require("../controllers/OrderController");

router.post("/", orderCtrl.createOrder);
router.post("/:orderId/confirm-payment", orderCtrl.confirmPayment);

module.exports = router;
