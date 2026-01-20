const express = require("express");
const RazorpayService = require("../services/razorpayService");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

// Create Razorpay order
router.post("/create-order", auth, async (req, res) => {
  try {
    console.log("🔥 BACKEND DEBUG - Received request body:", req.body);
    const { amount, customerInfo } = req.body;

    console.log("Amount received:", amount);
    console.log("Amount type:", typeof amount);

    // 🔥 IMPROVED: Convert to number and validate
    const amountNum = Number(amount);
    
    if (!amount || isNaN(amountNum)) {
      console.error("❌ Invalid amount:", amount);
      return res.status(400).json({ 
        success: false,
        message: "Amount must be a valid number" 
      });
    }

    if (amountNum <= 0) {
      console.error("❌ Amount too small:", amountNum);
      return res.status(400).json({ 
        success: false,
        message: "Amount must be greater than 0" 
      });
    }

    // 🔥 FIX: Use Math.round to avoid decimal precision issues
    const amountInPaise = Math.round(amountNum * 100);
    
    console.log("Amount in paise:", amountInPaise);

    const options = {
      amount: amountInPaise, // Now guaranteed to be integer
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("Razorpay options:", options);

    const razorpayOrder = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    console.error("Full error object:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
});


// FIXED: Verify payment
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    console.log("=== PAYMENT VERIFICATION START ===");
    console.log("Received data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing payment verification data");
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification data",
      });
    }

    // Verify signature
    const isValidSignature = RazorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("✅ Signature verification successful");

    // Get payment details from Razorpay
    let paymentDetails;
    try {
      paymentDetails = await RazorpayService.getPaymentDetails(
        razorpay_payment_id
      );
      console.log("Payment details fetched:", paymentDetails.status);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      // Continue without payment details if API fails
      paymentDetails = { status: "captured", method: "unknown" };
    }

    // If orderId is provided, find and update the order
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if user owns this order
      if (order.user.toString() !== req.userId) {
        console.error("Unauthorized access to order");
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to order",
        });
      }

      // Update order with payment details
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentMethod = "razorpay";
      order.paymentResult = {
        id: razorpay_payment_id,
        status: paymentDetails.status,
        update_time: new Date().toISOString(),
        email_address: paymentDetails.email || "",
        razorpay_order_id: razorpay_order_id,
        method: paymentDetails.method,
        amount: paymentDetails.amount ? paymentDetails.amount / 100 : 0,
      };

      // Update order status
      if (order.status === "pending") {
        order.status = "processing";
      }

      // 🔥 MARK COUPON AS USED AFTER SUCCESSFUL PAYMENT
      if (order.couponCode) {
        console.log("=== MARKING COUPON AS USED ===");
        console.log("Coupon code from order:", order.couponCode);

        const User = require("../models/User");
        const user = await User.findById(order.user);

        if (
          user &&
          user.loyalty &&
          Array.isArray(user.loyalty.claimedCoupons)
        ) {
          console.log(
            "User coupons before marking:",
            user.loyalty.claimedCoupons.map((c) => ({
              code: c.code,
              usedAt: c.usedAt,
            }))
          );

          const couponIndex = user.loyalty.claimedCoupons.findIndex(
            (c) => c.code === order.couponCode && !c.usedAt
          );

          console.log("Coupon index found:", couponIndex);

          if (couponIndex !== -1) {
            user.loyalty.claimedCoupons[couponIndex].usedAt = new Date();
            await user.save();
            console.log(
              `✅ Coupon ${order.couponCode} marked as used for user ${user._id}`
            );
          } else {
            console.log("❌ Coupon not found or already used");
          }
        } else {
          console.log("❌ User or loyalty data not found");
        }
      } else {
        console.log("No coupon code found in order");
      }

      await order.save();
      console.log("✅ Order updated successfully:", order._id);
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: orderId,
      paymentMethod: paymentDetails.method || "razorpay",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
});

// Get payment details (admin only)
router.get("/payment/:paymentId", [auth, admin], async (req, res) => {
  try {
    const paymentDetails = await RazorpayService.getPaymentDetails(
      req.params.paymentId
    );
    res.json({ success: true, payment: paymentDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create refund (admin only)
router.post("/refund", [auth, admin], async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const refund = await RazorpayService.createRefund(
      paymentId,
      amount,
      reason
    );

    res.json({
      success: true,
      refund: refund,
      message: "Refund created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Webhook handler for payment events
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const body = req.body;

      // Verify webhook signature
      const isValid = RazorpayService.verifyWebhookSignature(
        body,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );

      if (!isValid) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }

      const event = JSON.parse(body);
      console.log("Razorpay webhook event:", event.event);

      // Handle different webhook events
      switch (event.event) {
        case "payment.captured":
          console.log("Payment captured:", event.payload.payment.entity.id);
          break;

        case "payment.failed":
          console.log("Payment failed:", event.payload.payment.entity.id);
          break;

        case "refund.processed":
          console.log("Refund processed:", event.payload.refund.entity.id);
          break;

        default:
          console.log("Unhandled webhook event:", event.event);
      }

      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  }
);

module.exports = router;
