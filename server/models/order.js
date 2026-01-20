const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    loyaltyStampAdded: {
      type: Boolean,
      default: false,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "razorpay"],
      default: "razorpay",
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      method: String,
      // amount: Number
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    couponCode: {
      type: String,
      default: null,
    },
    cancellationReason: String,
    cancellationDate: Date,

    razorpayOrderId: {
      type: String,
      default: null
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },

    // Return and Refund fields
    returnStatus: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "pickup_scheduled",
        "picked_up",
        "refund_processing",
        "refund_completed",
        null,
      ],
      default: null,
    },
    returnReason: String,
    returnDetails: String,
    returnRequestedAt: Date,
    returnApprovedAt: Date,
    returnRejectedAt: Date,
    returnPickupScheduledAt: Date,
    returnPickedUpAt: Date,

    // Refund fields
    refundAmount: Number,
    refundMethod: {
      type: String,
      enum: ["original_payment", "bank_transfer", "wallet"],
      default: "original_payment",
    },
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", null],
      default: null,
    },
    refundInitiatedAt: Date,
    refundCompletedAt: Date,
    refundTransactionId: String,
    refundNotes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
