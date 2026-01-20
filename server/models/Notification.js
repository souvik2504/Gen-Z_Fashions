const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    color: {
      type: String,
      required: true,
    },
    subscribers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        subscribedAt: {
          type: Date,
          default: Date.now,
        },
        notified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
notificationSchema.index({ productId: 1, size: 1, color: 1 });

// Method to add subscriber
notificationSchema.methods.addSubscriber = function (userId, email, name) {
  // Check if user already subscribed
  const existingSubscriber = this.subscribers.find(
    (sub) => sub.userId.toString() === userId.toString()
  );

  if (existingSubscriber) {
    return false; // Already subscribed
  }

  this.subscribers.push({
    userId,
    email,
    name,
    subscribedAt: new Date(),
    notified: false,
  });

  return true; // Successfully added
};

// Method to mark subscribers as notified
notificationSchema.methods.markAsNotified = function () {
  this.subscribers.forEach((subscriber) => {
    subscriber.notified = true;
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
