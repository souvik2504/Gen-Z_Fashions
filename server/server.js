const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const dotenv = require("dotenv");
const stampEligibleOrders = require("./utils/loyaltyStamper");
const schedule = require("node-schedule");
const fs = require("fs");

require('dotenv').config();

const app = express();

// 🔥 PERFORMANCE: Add compression middleware FIRST
app.use(compression());

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 🔥 PERFORMANCE: Add cache control headers for static files
app.use("/uploads", express.static("uploads", {
  maxAge: '1d',
  etag: false,
  lastModified: false
}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/razorpay", require("./routes/razorpay"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/banners", require("./routes/banners"));
app.use("/api/loyalty", require("./routes/loyalty"));
app.use("/api/surprises", require("./routes/surprises"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/cart", require("./routes/cart"));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use("/api", require("./routes/notifications"));
// app.use('/api/ai', aiRoutes);
app.use('/api/ai', require('./routes/ai'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads/payment-proofs/")) {
  fs.mkdirSync("uploads/payment-proofs/", { recursive: true });
}

// 🔥 ADD: Email service test function
const testEmailService = async () => {
  try {
    const { testEmailConnection } = require('./utils/emailService');
    const isReady = await testEmailConnection();
    
    if (isReady) {
      console.log('✅ Email service is ready');
    } else {
      console.log('⚠️ Email service configuration issue - check your .env EMAIL settings');
    }
  } catch (error) {
    console.log('⚠️ Email service not configured or error:', error.message);
    console.log('   Make sure to set EMAIL_USER, EMAIL_PASS in .env for welcome emails');
  }
};

// 🔥 UPDATED: Database connection with email service test
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tshirt-store");
    console.log("MongoDB connected");
    
    // Test email service after DB connection
    await testEmailService();
    
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Schedule the stamper to run daily at 2 AM
schedule.scheduleJob("0 2 * * *", async () => {
  try {
    const numStamped = await stampEligibleOrders();
    console.log(
      `${new Date().toISOString()} - Loyalty stamper awarded ${numStamped} stamps.`
    );
  } catch (error) {
    console.error("Error running loyalty stamper:", error);
  }
});

// Optional: run stamper once on server start during development
if (process.env.NODE_ENV === "development") {
  (async () => {
    try {
      const numStamped = await stampEligibleOrders();
      console.log(
        `[dev run] Loyalty stamper executed; stamped ${numStamped} orders.`
      );
    } catch (error) {
      console.error("Error running dev loyalty stamper:", error);
    }
  })();
}

// 🔥 UPDATED: Start server with proper async setup
const startServer = async () => {
  try {
    // Connect to database and test email service
    await connectDatabase();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
