const express = require("express");
const Order = require("../models/order");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
// const mongoose = require('mongoose');
const {
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendReturnRequestEmail,
  calculateEstimatedDelivery,
} = require("../utils/emailService");

const router = express.Router();

// Create order
router.post("/", auth, async (req, res) => {
  try {
    console.log("=== CREATING ORDER ===");
    console.log("User ID:", req.userId);
    console.log("Order data received:", req.body);

    const {
      orderItems,
      shippingAddress,
      paymentMethod = "pending",
      paymentResult,
      totalPrice,
      isPaid = false,
      paidAt,
      status = "pending",
      couponCode,
    } = req.body;

    // Validate required fields (your existing validation code)
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const requiredShippingFields = [
      "name",
      "phone",
      "street",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    const missingFields = requiredShippingFields.filter(
      (field) => !shippingAddress[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required shipping fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingAddress.phone.replace(/\s+/g, ""))) {
      return res.status(400).json({
        message: "Please provide a valid 10-digit mobile number",
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ message: "Valid total price is required" });
    }

    // Create order
    const order = new Order({
      user: req.userId,
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: {
        name: shippingAddress.name.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zipCode: shippingAddress.zipCode.trim(),
        country: shippingAddress.country.trim(),
      },
      paymentMethod,
      paymentResult: paymentResult || {},
      totalPrice,
      isPaid,
      paidAt,
      status: paymentMethod === "cod" ? "processing" : status, // 🔥 COD goes directly to processing
      couponCode: couponCode || null,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
    });

    const savedOrder = await order.save();

    const Product = require('../models/product');

    // 🔥 NEW: Variant-based stock reduction
    await Promise.all(order.orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`Product not found: ${item.product}`);
        return;
      }

      // Find the specific variant (size + color combination)
      const variantIndex = product.variants.findIndex(v => 
        v.size === item.size && v.color === item.color
      );

      if (variantIndex !== -1) {
        const variant = product.variants[variantIndex];
        
        if (variant.stock >= item.quantity) {
          product.variants[variantIndex].stock -= item.quantity;
          console.log(`✅ Reduced stock for ${item.name} (${item.color} - ${item.size}): ${variant.stock} -> ${variant.stock - item.quantity}`);
        } else {
          // Handle overselling - set to 0 or throw error
          console.log(`⚠️ Insufficient stock for ${item.name} (${item.color} - ${item.size}). Available: ${variant.stock}, Requested: ${item.quantity}`);
          product.variants[variantIndex].stock = 0;
        }
        
        await product.save();
      } else {
        console.log(`❌ Variant not found: ${item.name} (${item.color} - ${item.size})`);
      }
    }));

    console.log("✅ Order created successfully:", savedOrder._id);
    console.log("Customer details:", {
      name: savedOrder.shippingAddress.name,
      phone: savedOrder.shippingAddress.phone,
    });

    // 🔥 ENHANCED DEBUG: Check all conditions for COD coupon marking
    console.log("=== COD COUPON MARKING DEBUG ===");
    console.log("1. couponCode exists?", !!couponCode);
    console.log("2. couponCode value:", JSON.stringify(couponCode));
    console.log("3. paymentMethod value:", JSON.stringify(paymentMethod));
    console.log("4. paymentMethod === 'cod'?", paymentMethod === "cod");
    console.log(
      "5. Both conditions met?",
      !!(couponCode && paymentMethod === "cod")
    );

    // 🔥 CRITICAL FIX: Mark coupon as used for COD orders
    if (couponCode && paymentMethod === "cod") {
      console.log(`🔧 STARTING COD coupon marking for ${couponCode}`);

      const User = require("../models/user");
      const user = await User.findById(req.userId);

      console.log("6. User found?", !!user);
      console.log("7. User has loyalty?", !!user?.loyalty);
      console.log(
        "8. User has claimedCoupons?",
        !!user?.loyalty?.claimedCoupons
      );
      console.log(
        "9. ClaimedCoupons is array?",
        Array.isArray(user?.loyalty?.claimedCoupons)
      );

      if (user && user.loyalty && Array.isArray(user.loyalty.claimedCoupons)) {
        console.log(
          "0. User coupons before COD update:",
          user.loyalty.claimedCoupons.map((c) => ({
            code: c.code,
            usedAt: c.usedAt,
            expired: c.expiresAt < new Date(),
          }))
        );

        const couponIndex = user.loyalty.claimedCoupons.findIndex(
          (c) => c.code === couponCode && !c.usedAt // Find unused coupon
        );

        console.log("11. Coupon index found:", couponIndex);

        if (couponIndex !== -1) {
          console.log("12. MARKING COUPON AS USED...");
          user.loyalty.claimedCoupons[couponIndex].usedAt = new Date();
          await user.save();
          console.log(
            `✅ COD Coupon ${couponCode} marked as used for user ${user._id}`
          );
          // 🔥 VERIFY: Double-check the coupon was actually marked
          const verifyUser = await User.findById(req.userId);
          const verifiedCoupon = verifyUser.loyalty.claimedCoupons.find(
            (c) => c.code === couponCode
          );
          console.log(
            "13. VERIFICATION - Coupon usedAt after save:",
            verifiedCoupon?.usedAt
          );
        } else {
          console.log("❌ COD Coupon not found or already used");
        }
      } else {
        console.log("❌ User or loyalty data structure issue");
      }
    } else {
      console.log("❌ COD Coupon marking conditions not met");
      if (!couponCode) console.log("   - Missing couponCode");
      if (paymentMethod !== "cod")
        console.log("   - PaymentMethod is not 'cod':", paymentMethod);
    }

    try {
      const User = require("../models/user");
      const user = await User.findById(req.userId);

      if (user && user.email) {
        console.log("📧 Sending order confirmation email...");
        const orderEmailData = prepareOrderEmailData(savedOrder, user);

        // Send email asynchronously (don't wait for it)
        sendOrderConfirmationEmail(orderEmailData)
          .then((result) => {
            if (result.success) {
              console.log(`✅ Order confirmation email sent to ${user.email}`);
            } else {
              console.error(
                `❌ Failed to send order confirmation email:`,
                result.error
              );
            }
          })
          .catch((error) => {
            console.error(`❌ Order confirmation email error:`, error);
          });
      }
    } catch (emailError) {
      console.error("❌ Error preparing order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({
      message: error.message || "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Helper function to prepare order data for email
const prepareOrderEmailData = (order, user) => {
  return {
    orderNumber: order._id.toString().slice(-8).toUpperCase(), // Last 8 chars as order number
    customerName: order.shippingAddress.name,
    customerEmail: user.email,
    orderItems: order.orderItems,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    totalPrice: order.totalPrice,
    orderDate: order.createdAt,
    trackingNumber: order.trackingNumber || null,
  };
};

// Get user orders
router.get("/myorders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
// router.get("/:id", auth, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("user", "name email")
//       .populate("orderItems.product", "name images");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Check if user owns this order or is admin
//     if (
//       order.user._id.toString() !== req.userId &&
//       req.user?.role !== "admin"
//     ) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // Only allow deletion of pending/unpaid orders
//     if (order.isPaid || order.status !== "pending") {
//       return res.status(400).json({
//         message: "Cannot delete paid or processed orders",
//       });
//     }

//     await Order.findByIdAndDelete(req.params.id);
//     console.log(`✅ Cancelled order ${req.params.id} deleted`);

//     res.json(order);
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// GET single order by ID - BULLETPROOF VERSION
router.get('/:id', auth, async (req, res) => {
  console.log('=== GET ORDER ===');
  console.log('Order ID:', req.params.id);
  console.log('User ID:', req.userId);
  
  try {
    // Find order
    const order = await Order.findById(req.params.id);
    
    console.log('Order found:', !!order);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check ownership
    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // SAFELY handle items - even if undefined or empty
    const safeItems = order.items || [];
    
    console.log('Items length:', safeItems.length);
    
    // Return everything from the order
    res.json(order);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order to paid
router.put("/:id/pay", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    if (order.status === "pending") {
      order.status = "processing";
    }

    // 🔥 DEBUG: Check if couponCode exists
    console.log("=== PAYMENT CONFIRMATION DEBUG ===");
    console.log("Order couponCode:", order.couponCode);
    console.log("Order ID:", order._id);
    console.log("User ID:", order.user);

    if (order.couponCode) {
      // Load user to update coupon usage
      const User = require("../models/user"); // require here to avoid circular import if needed
      const user = await User.findById(order.user);

      console.log("User found:", !!user);
      console.log(
        "User loyalty coupons count:",
        user?.loyalty?.claimedCoupons?.length || 0
      );

      if (user && user.loyalty && Array.isArray(user.loyalty.claimedCoupons)) {
        // 🔥 DEBUG: Log all user coupons before update
        console.log(
          "User coupons before update:",
          user.loyalty.claimedCoupons.map((c) => ({
            code: c.code,
            usedAt: c.usedAt,
            expired: c.expiresAt < new Date(),
          }))
        );

        const couponIndex = user.loyalty.claimedCoupons.findIndex(
          (c) => c.code === order.couponCode && !c.usedAt
        );

        if (couponIndex !== -1) {
          user.loyalty.claimedCoupons[couponIndex].usedAt = new Date();
          await user.save();
          console.log(
            `Coupon ${order.couponCode} marked as used for user ${user._id}`
          );

          const updatedUser = await User.findById(order.user);
          const updatedCoupon = updatedUser.loyalty.claimedCoupons.find(
            (c) => c.code === order.couponCode
          );
        } else {
          console.log("❌ Coupon not found or already used");
        }
      } else {
        console.log("❌ User or loyalty data not found");
      }
    } else {
      console.log("❌ No couponCode found in order");
    }

    const updatedOrder = await order.save();

    // 🔥 NEW: Send order confirmation email for paid orders
    try {
      const User = require("../models/user");
      const user = await User.findById(order.user);

      if (user && user.email) {
        console.log("📧 Sending order confirmation email for paid order...");
        const orderEmailData = prepareOrderEmailData(updatedOrder, user);

        sendOrderConfirmationEmail(orderEmailData)
          .then((result) => {
            if (result.success) {
              console.log(`✅ Order confirmation email sent to ${user.email}`);
            } else {
              console.error(
                `❌ Failed to send order confirmation email:`,
                result.error
              );
            }
          })
          .catch((error) => {
            console.error(`❌ Order confirmation email error:`, error);
          });
      }
    } catch (emailError) {
      console.error("❌ Error preparing order confirmation email:", emailError);
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order payment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedStatuses = ["pending", "processing"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled. It may have already been shipped or delivered.",
      });
    }

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
    const cancellationWindow = order.isPaid ? 1 : 24;

    if (hoursDiff > cancellationWindow) {
      return res.status(400).json({
        message: `Cancellation window has expired. Orders can be cancelled within ${cancellationWindow} hour(s) of placement.`,
      });
    }

    order.status = "cancelled";
    order.cancellationReason = reason;
    order.cancellationDate = new Date();

    if (order.isPaid) {
      order.refundStatus = "pending";
      order.refundInitiatedAt = new Date();
    }

    await order.save();

    // Send cancellation email
    try {
      const User = require("../models/user");
      const user = await User.findById(order.user);

      if (user && user.email) {
        console.log("📧 Sending order cancellation email...");
        const orderEmailData = {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.shippingAddress.name,
          customerEmail: user.email,
          orderItems: order.orderItems,
          totalPrice: order.totalPrice,
          refundAmount: order.isPaid ? order.totalPrice : null,
          refundMethod: order.isPaid ? "Original Payment Method" : null,
          cancellationReason: reason,
          cancellationDate: order.cancellationDate,
        };

        sendOrderCancellationEmail(orderEmailData)
          .then((result) => {
            if (result.success) {
              console.log(`✅ Cancellation email sent to ${user.email}`);
            } else {
              console.error(
                `❌ Failed to send cancellation email:`,
                result.error
              );
            }
          })
          .catch((error) => {
            console.error(`❌ Cancellation email error:`, error);
          });
      }
    } catch (emailError) {
      console.error("❌ Error preparing cancellation email:", emailError);
    }

    res.json({
      message: "Order cancelled successfully",
      refundMessage: order.isPaid
        ? "Refund will be processed within 5-7 business days"
        : null,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add these admin routes to your orders.js

// Update your ship route with enhanced debugging
// router.put("/:id/ship", [auth, admin], async (req, res) => {
//   try {
//     console.log("=== SHIP ROUTE CALLED ===");
//     console.log("Order ID:", req.params.id);
//     console.log("Request body:", req.body);
//     console.log("User ID:", req.userId);

//     const { trackingNumber, courierPartner } = req.body;
//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log("✅ Order found, current status:", order.status);

//     if (order.status !== "processing") {
//       console.log("❌ Order status is not 'processing', it's:", order.status);
//       return res.status(400).json({
//         message: "Only processing orders can be marked as shipped",
//       });
//     }

//     // Update order
//     order.status = "shipped";
//     order.shippedAt = new Date();
//     order.trackingNumber = trackingNumber;
//     order.courierPartner = courierPartner;

//     await order.save();
//     console.log("✅ Order updated to shipped status");

//     // 🔥 FIXED: Email sending process
//     try {
//       const User = require("../models/user");
//       const user = await User.findById(order.user);

//       console.log("🔍 Looking for user:", order.user);
//       console.log("✅ User found:", !!user);
//       console.log("📧 User email:", user?.email);

//       if (user && user.email) {
//         console.log("📧 STARTING to send order shipped email...");

//         // 🔥 FIX: Direct function call (already imported at top)
//         const estimatedDelivery = calculateEstimatedDelivery(
//           order.paymentMethod,
//           order.shippingAddress.city,
//           order.shippingAddress.state
//         );

//         console.log("📅 Estimated delivery calculated:", estimatedDelivery);

//         const orderEmailData = {
//           orderNumber: order._id.toString().slice(-8).toUpperCase(),
//           customerName: order.shippingAddress.name,
//           customerEmail: user.email,
//           orderItems: order.orderItems,
//           shippingAddress: order.shippingAddress,
//           trackingNumber: trackingNumber,
//           courierPartner: courierPartner || "Express Delivery",
//           estimatedDelivery: estimatedDelivery,
//         };

//         console.log("📦 Email data prepared:", {
//           orderNumber: orderEmailData.orderNumber,
//           customerEmail: orderEmailData.customerEmail,
//           trackingNumber: orderEmailData.trackingNumber,
//         });

//         // 🔥 FIX: Direct function call (already imported at top)
//         const emailResult = await sendOrderShippedEmail(orderEmailData);

//         console.log("📧 Email sending result:", emailResult);

//         if (emailResult.success) {
//           console.log(`✅ Shipped email sent successfully to ${user.email}`);
//         } else {
//           console.error(`❌ Failed to send shipped email:`, emailResult.error);
//         }
//       } else {
//         console.log("❌ User not found or no email address");
//       }
//     } catch (emailError) {
//       console.error("❌ Error in shipped email process:", emailError);
//     }

//     res.json({
//       message: "Order marked as shipped successfully",
//       order: order,
//     });
//   } catch (error) {
//     console.error("❌ Error marking order as shipped:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update your deliver route with enhanced debugging
// router.put("/:id/deliver", [auth, admin], async (req, res) => {
//   try {
//     console.log("=== DELIVER ROUTE CALLED ===");
//     console.log("Order ID:", req.params.id);
//     console.log("User ID:", req.userId);

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       console.log("❌ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log("✅ Order found, current status:", order.status);

//     if (order.status !== "shipped") {
//       console.log("❌ Order status is not 'shipped', it's:", order.status);
//       return res.status(400).json({
//         message: "Only shipped orders can be marked as delivered",
//       });
//     }

//     // Update order
//     order.status = "delivered";
//     order.isDelivered = true;
//     order.deliveredAt = new Date();

//     await order.save();
//     console.log("✅ Order updated to delivered status");

//     // 🔥 FIXED: Email sending process
//     try {
//       const User = require("../models/user");
//       const user = await User.findById(order.user);

//       console.log("🔍 Looking for user:", order.user);
//       console.log("✅ User found:", !!user);
//       console.log("📧 User email:", user?.email);

//       if (user && user.email) {
//         console.log("📧 STARTING to send order delivered email...");

//         const orderEmailData = {
//           orderNumber: order._id.toString().slice(-8).toUpperCase(),
//           customerName: order.shippingAddress.name,
//           customerEmail: user.email,
//           orderItems: order.orderItems,
//           totalPrice: order.totalPrice,
//           deliveredDate: order.deliveredAt,
//         };

//         console.log("📦 Email data prepared:", {
//           orderNumber: orderEmailData.orderNumber,
//           customerEmail: orderEmailData.customerEmail,
//           deliveredDate: orderEmailData.deliveredDate,
//         });

//         // 🔥 FIX: Direct function call (already imported at top)
//         const emailResult = await sendOrderDeliveredEmail(orderEmailData);

//         console.log("📧 Email sending result:", emailResult);

//         if (emailResult.success) {
//           console.log(`✅ Delivered email sent successfully to ${user.email}`);
//         } else {
//           console.error(
//             `❌ Failed to send delivered email:`,
//             emailResult.error
//           );
//         }
//       } else {
//         console.log("❌ User not found or no email address");
//       }
//     } catch (emailError) {
//       console.error("❌ Error in delivered email process:", emailError);
//     }

//     res.json({
//       message: "Order marked as delivered successfully",
//       order: order,
//     });
//   } catch (error) {
//     console.error("❌ Error marking order as delivered:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

router.post("/orders/:id/loyalty-stamp", [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.loyaltyStampAdded)
      return res
        .status(400)
        .json({ message: "Order already stamped or not found" });

    const user = await User.findById(order.user);
    if (user.loyalty.stamps < 10) user.loyalty.stamps += 1;
    user.save();

    order.loyaltyStampAdded = true;
    order.save();

    res.json({ message: "Loyalty stamp added for this order" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Request order return
router.put("/:id/return", auth, async (req, res) => {
  try {
    const { reason, details } = req.body;

    console.log("=== PROCESSING RETURN REQUEST ===");
    console.log("Order ID:", req.params.id);
    console.log("User ID:", req.userId);
    console.log("Return Reason:", reason);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if order is delivered
    if (!order.isDelivered || order.status !== "delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be returned",
      });
    }

    // Check if already has return request
    if (order.returnStatus) {
      return res.status(400).json({
        message: "Return request already exists for this order",
      });
    }

    // Check return window (7 days from delivery)
    const deliveryDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysDiff = (now - deliveryDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      return res.status(400).json({
        message: "Return window has expired. Returns are allowed within 7 days of delivery.",
      });
    }

    // Validate required fields
    if (!reason || !details) {
      return res.status(400).json({
        message: "Return reason and details are required",
      });
    }

    // Update order with return information
    order.returnStatus = "requested";
    order.returnReason = reason;
    order.returnDetails = details;
    order.returnRequestedAt = new Date();

    await order.save();
    console.log("✅ Return request submitted successfully");

    // 🔥 NEW: Send return request confirmation email
    try {
      const User = require('../models/user');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        console.log('📧 Sending return request confirmation email...');
        
        const returnEmailData = {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.shippingAddress.name,
          customerEmail: user.email,
          orderItems: order.orderItems,
          returnReason: reason,
          returnDetails: details,
          requestDate: order.returnRequestedAt,
          totalPrice: order.totalPrice
        };
        
        console.log("📦 Return email data prepared:", {
          orderNumber: returnEmailData.orderNumber,
          customerEmail: returnEmailData.customerEmail,
          returnReason: returnEmailData.returnReason
        });
        
        const emailResult = await sendReturnRequestEmail(returnEmailData);
        if (emailResult.success) {
          console.log(`✅ Return request confirmation email sent to ${user.email}`);
        } else {
          console.error(`❌ Failed to send return request email:`, emailResult.error);
        }
      } else {
        console.log("❌ User not found or no email address");
      }
    } catch (emailError) {
      console.error('❌ Error preparing return request email:', emailError);
      // Don't fail the return request if email fails
    }

    res.json({
      message: "Return request submitted successfully",
      returnInfo: {
        status: order.returnStatus,
        reason: order.returnReason,
        requestedAt: order.returnRequestedAt,
      },
    });
  } catch (error) {
    console.error("❌ Return request error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.get("/", [auth, admin], async (req, res) => {
  try {
    const { page = 1, status, payment } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (payment && payment !== "all") filter.paymentMethod = payment;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
