const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const User = require("../models/user");
const { sendBackInStockEmail } = require("../utils/emailService");

// POST /api/notify-me - Subscribe for notifications
router.post("/notify-me", auth, async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    console.log("=== NOTIFY ME REQUEST ===");
    console.log("Product ID:", productId);
    console.log("Size:", size);
    console.log("Color:", color);
    console.log("User ID:", req.userId);

    // Get user info
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if variant exists and is out of stock
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    if (!variant) {
      return res.status(400).json({ message: "Product variant not found" });
    }

    if (variant.stock > 0) {
      return res.status(400).json({
        message: "Product is currently in stock. No need for notification.",
        inStock: true,
      });
    }

    // Find or create notification document
    let notification = await Notification.findOne({
      productId,
      size,
      color,
    });

    if (!notification) {
      // Create new notification document
      notification = new Notification({
        productId,
        size,
        color,
        subscribers: [],
      });
    }

    // Add subscriber
    const wasAdded = notification.addSubscriber(
      req.userId,
      user.email,
      user.name
    );

    if (!wasAdded) {
      return res.json({
        message:
          "You are already subscribed for notifications for this product variant.",
        alreadySubscribed: true,
      });
    }

    await notification.save();

    console.log("✅ Notification subscription saved:", {
      productId,
      size,
      color,
      subscriberCount: notification.subscribers.length,
    });

    res.json({
      message:
        "Successfully subscribed! We'll notify you when this item is back in stock.",
      success: true,
      subscriberCount: notification.subscribers.length,
    });
  } catch (error) {
    console.error("❌ Error in notify-me:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/notify-me/user - Get user's subscriptions
router.get("/notify-me/user", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      "subscribers.userId": req.userId,
      "subscribers.notified": false,
    }).populate("productId", "name images price");

    const userSubscriptions = notifications.map((notification) => {
      const userSubscription = notification.subscribers.find(
        (sub) => sub.userId.toString() === req.userId.toString()
      );

      return {
        _id: notification._id,
        product: notification.productId,
        size: notification.size,
        color: notification.color,
        subscribedAt: userSubscription?.subscribedAt,
        notified: userSubscription?.notified,
      };
    });

    res.json({ subscriptions: userSubscriptions });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Routes

// GET /api/admin/notifications - Get all notification requests
router.get("/admin/notifications", [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status === "pending") {
      filter["subscribers.notified"] = false;
    } else if (status === "notified") {
      filter["subscribers.notified"] = true;
    }

    const notifications = await Notification.find(filter)
      .populate("productId", "name images price variants")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);

    // Transform data for frontend
    const notificationData = notifications.map((notification) => {
      const product = notification.productId;
      const variant = product.variants.find(
        (v) => v.size === notification.size && v.color === notification.color
      );

      const pendingSubscribers = notification.subscribers.filter(
        (sub) => !sub.notified
      );
      const notifiedSubscribers = notification.subscribers.filter(
        (sub) => sub.notified
      );

      return {
        _id: notification._id,
        product: {
          _id: product._id,
          name: product.name,
          image: product.images?.[0] || "/placeholder-tshirt.jpg",
          price: product.price,
        },
        size: notification.size,
        color: notification.color,
        currentStock: variant?.stock || 0,
        pendingSubscribers: pendingSubscribers.length,
        notifiedSubscribers: notifiedSubscribers.length,
        totalSubscribers: notification.subscribers.length,
        subscribers: notification.subscribers,
        isInStock: (variant?.stock || 0) > 0,
        canNotify: (variant?.stock || 0) > 0 && pendingSubscribers.length > 0,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      };
    });

    res.json({
      notifications: notificationData,
      currentPage: parseInt(page),
      totalPages,
      totalNotifications,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/notifications/:id/notify - Send notifications to subscribers
router.post(
  "/admin/notifications/:id/notify",
  [auth, admin],
  async (req, res) => {
    try {
      const notificationId = req.params.id;

      console.log("=== SENDING STOCK NOTIFICATIONS ===");
      console.log("Notification ID:", notificationId);

      const notification = await Notification.findById(notificationId).populate(
        "productId"
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const product = notification.productId;

      // Check if variant is in stock
      const variant = product.variants.find(
        (v) => v.size === notification.size && v.color === notification.color
      );

      if (!variant || variant.stock === 0) {
        return res.status(400).json({
          message:
            "Product variant is still out of stock. Cannot send notifications.",
        });
      }

      // Get pending subscribers (not yet notified)
      const pendingSubscribers = notification.subscribers.filter(
        (sub) => !sub.notified
      );

      if (pendingSubscribers.length === 0) {
        return res.status(400).json({
          message: "No pending subscribers to notify for this variant.",
        });
      }

      console.log(
        `📧 Sending notifications to ${pendingSubscribers.length} subscribers`
      );

      let successCount = 0;
      let failureCount = 0;

      // Send emails to all pending subscribers
      for (const subscriber of pendingSubscribers) {
        try {
          const emailData = {
            orderNumber: `${product._id.toString().slice(-8).toUpperCase()}-${
              notification.size
            }-${notification.color}`,
            customerName: subscriber.name,
            customerEmail: subscriber.email,
            productName: product.name,
            productImage: product.images?.[0] || "/placeholder-tshirt.jpg",
            productPrice: product.price,
            size: notification.size,
            color: notification.color,
            currentStock: variant.stock,
            productUrl: `${process.env.FRONTEND_URL}/products/${product._id}`,
          };

          const emailResult = await sendBackInStockEmail(emailData);

          if (emailResult.success) {
            console.log(`✅ Notification sent to ${subscriber.email}`);
            successCount++;

            // Mark as notified
            subscriber.notified = true;
          } else {
            console.error(
              `❌ Failed to send notification to ${subscriber.email}:`,
              emailResult.error
            );
            failureCount++;
          }
        } catch (emailError) {
          console.error(`❌ Email error for ${subscriber.email}:`, emailError);
          failureCount++;
        }
      }

      // Save updated notification
      await notification.save();

      console.log(
        `📊 Notification Results: ${successCount} sent, ${failureCount} failed`
      );

      res.json({
        message: `Notifications sent successfully to ${successCount} subscribers`,
        results: {
          totalSubscribers: pendingSubscribers.length,
          successCount,
          failureCount,
        },
      });
    } catch (error) {
      console.error("❌ Error sending notifications:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /api/admin/notifications/:id - Delete notification record
router.delete("/admin/notifications/:id", [auth, admin], async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/admin/notifications/pending-count",
  [auth, admin],
  async (req, res) => {
    try {
      const notifications = await Notification.find({
        isActive: true,
        "subscribers.notified": false,
      }).populate("productId", "variants");

      let pendingCount = 0;

      // Count notifications where product is in stock and has pending subscribers
      for (const notification of notifications) {
        const product = notification.productId;
        const variant = product.variants.find(
          (v) => v.size === notification.size && v.color === notification.color
        );

        // Only count if variant is in stock and has unnotified subscribers
        if (variant && variant.stock > 0) {
          const pendingSubscribers = notification.subscribers.filter(
            (sub) => !sub.notified
          );
          if (pendingSubscribers.length > 0) {
            pendingCount++;
          }
        }
      }

      res.json({
        pendingCount,
        hasPendingNotifications: pendingCount > 0,
      });
    } catch (error) {
      console.error("Error fetching pending notifications count:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
