const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const { 
  sendReturnApprovedEmail,
  sendReturnRejectedEmail, 
  sendReturnPickedUpEmail,
  sendRefundProcessingEmail,
  sendRefundCompletedEmail
} = require('../utils/emailService');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image file!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Dashboard Stats
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: {
        isPaid: true,
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
      }},
      { $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      topProducts,
      ordersByStatus,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Management
router.get('/products', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update the existing POST /products route
router.post('/products', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    console.log('Creating product with variants...');
    console.log('Request body variants (raw):', req.body.variants);
    console.log('Type of variants:', typeof req.body.variants);
    
    // 🔥 FIX: Parse variants JSON string
    let parsedVariants = [];
    try {
      parsedVariants = typeof req.body.variants === 'string' 
        ? JSON.parse(req.body.variants) 
        : req.body.variants || [];
    } catch (parseError) {
      console.error('Error parsing variants JSON:', parseError);
      return res.status(400).json({ message: 'Invalid variants format' });
    }

    console.log('Parsed variants:', parsedVariants);

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      variants: parsedVariants, // 🔥 Use parsed variants
      images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
      featured: req.body.featured === 'true' // Handle boolean from FormData
    };

    // 🔥 ADD: Validation for variants
    if (!productData.variants || productData.variants.length === 0) {
      return res.status(400).json({ message: 'At least one variant (size + color + stock) is required' });
    }

    // 🔥 ADD: Validate each variant
    for (const variant of productData.variants) {
      if (!variant.size || !variant.color || typeof variant.stock !== 'number' || variant.stock < 0) {
        return res.status(400).json({ 
          message: 'Each variant must have size, color, and valid stock (≥0)' 
        });
      }
    }

    console.log('Creating product with data:', productData);

    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created successfully with', product.variants.length, 'variants');
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🔥 ALSO UPDATE: The PUT route for editing products
router.put('/products/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    console.log('Updating product with variants...');
    
    // 🔥 FIX: Parse variants JSON string
    let parsedVariants = [];
    try {
      parsedVariants = typeof req.body.variants === 'string' 
        ? JSON.parse(req.body.variants) 
        : req.body.variants || [];
    } catch (parseError) {
      console.error('Error parsing variants JSON:', parseError);
      return res.status(400).json({ message: 'Invalid variants format' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      variants: parsedVariants, // 🔥 Use parsed variants
      featured: req.body.featured === 'true'
    };

    // Handle images
    let images = [];
    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      images = [...existingImages];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    if (images.length > 0) {
      updateData.images = images;
    }

    // 🔥 ADD: Validation for variants
    if (!updateData.variants || updateData.variants.length === 0) {
      return res.status(400).json({ message: 'At least one variant is required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product updated successfully with', product.variants.length, 'variants');
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});


// router.put('/products/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
//   try {
//     const updateData = {
//       ...req.body,
//       sizes: JSON.parse(req.body.sizes || '[]'),
//       colors: JSON.parse(req.body.colors || '[]')
//     };

//     // Handle images
//     let images = [];
//     // Add existing images if provided
//     if (req.body.existingImages) {
//       const existingImages = JSON.parse(req.body.existingImages);
//       images = [...existingImages];
//     }

//     // Add new uploaded images
//     if (req.files && req.files.length > 0) {
//       const newImages = req.files.map(file => `/uploads/${file.filename}`);
//       images = [...images, ...newImages];
//     }

//     if (images.length > 0) {
//       updateData.images = images;
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// User Management
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', [auth, admin], async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// ORDER MANAGEMENT - COMPLETE SECTION
// ---------------------------------------------------------------------------

// Get all orders (admin)
router.get('/orders', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', payment = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (payment && payment !== 'all') filter.paymentMethod = payment;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🔥 ADD MISSING: Update order status (admin)
router.put('/orders/:id/status', [auth, admin], async (req, res) => {
  try {
    // 🔥 FIX: Extract all needed fields from request body
    const { status, trackingNumber, courierPartner } = req.body;
    
    console.log('=== UPDATING ORDER STATUS ===');
    console.log('Order ID:', req.params.id);
    console.log('New Status:', status);
    console.log('Request body:', req.body); // 🔥 Debug what's being sent

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') 
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Capture oldStatus BEFORE updating
    const oldStatus = order.status;
    console.log("Old status:", oldStatus, "New status:", status);

    // Update order status
    order.status = status;

    // 🔥 ADD: Handle tracking info for shipped orders
    if (status === 'shipped') {
      order.isDelivered = false;
      order.deliveredAt = null;
      order.shippedAt = new Date();
      
      // Set tracking info if provided
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierPartner) order.courierPartner = courierPartner;
    }

    // If marking as delivered, update delivery info
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    console.log('✅ Order status updated successfully');

    // 🔥 FIXED: Email sending with proper variable handling
    try {
      const User = require('../models/user');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        console.log("📧 Checking if email should be sent...");
        
        if (status === 'shipped' && oldStatus !== 'shipped') {
          console.log("📧 Sending shipped email...");
          
          // Send shipped email
          const { sendOrderShippedEmail, calculateEstimatedDelivery } = require('../utils/emailService');
          const estimatedDelivery = calculateEstimatedDelivery(
            order.paymentMethod, 
            order.shippingAddress.city, 
            order.shippingAddress.state
          );
          
          // 🔥 FIX: Generate tracking number if not provided
          const finalTrackingNumber = trackingNumber || order.trackingNumber || `TRK${Date.now()}`;
          const finalCourierPartner = courierPartner || order.courierPartner || 'Express Delivery';
          
          console.log("📦 Using tracking number:", finalTrackingNumber);
          console.log("🚚 Using courier partner:", finalCourierPartner);
          
          const emailData = {
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            customerName: order.shippingAddress.name,
            customerEmail: user.email,
            orderItems: order.orderItems,
            shippingAddress: order.shippingAddress,
            trackingNumber: finalTrackingNumber,  // 🔥 Now properly defined
            courierPartner: finalCourierPartner,  // 🔥 Now properly defined
            estimatedDelivery
          };
          
          const emailResult = await sendOrderShippedEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Shipped email sent from status update');
          } else {
            console.error('❌ Failed to send shipped email:', emailResult.error);
          }
        }
        
        if (status === 'delivered' && oldStatus !== 'delivered') {
          console.log("📧 Sending delivered email...");
          
          // Send delivered email
          const { sendOrderDeliveredEmail } = require('../utils/emailService');
          
          const emailData = {
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            customerName: order.shippingAddress.name,
            customerEmail: user.email,
            orderItems: order.orderItems,
            totalPrice: order.totalPrice,
            deliveredDate: order.deliveredAt || new Date()
          };
          
          const emailResult = await sendOrderDeliveredEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Delivered email sent from status update');
          } else {
            console.error('❌ Failed to send delivered email:', emailResult.error);
          }
        }
      } else {
        console.log("❌ User not found or no email address");
      }
    } catch (emailError) {
      console.error('❌ Email error in status update:', emailError);
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        trackingNumber: order.trackingNumber,
        courierPartner: order.courierPartner
      }
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});


// Update order delivery status (admin)
router.put('/orders/:id/delivery', [auth, admin], async (req, res) => {
  try {
    const { isDelivered } = req.body;
    
    console.log('=== UPDATING ORDER DELIVERY STATUS ===');
    console.log('Order ID:', req.params.id);
    console.log('Is Delivered:', isDelivered);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 🔥 ADD: Capture previous delivery status
    const wasDelivered = order.isDelivered;
    console.log('Previous delivery status:', wasDelivered, 'New status:', isDelivered);

    order.isDelivered = isDelivered;
    
    if (isDelivered) {
      order.deliveredAt = new Date();
      order.status = 'delivered';
    } else {
      order.deliveredAt = null;
      // Don't automatically change status when unmarking as delivered
    }

    await order.save();
    console.log('✅ Order delivery status updated successfully');

    // 🔥 ADD: Send delivered email when marking as delivered
    if (isDelivered && !wasDelivered) {
      try {
        const User = require('../models/user');
        const user = await User.findById(order.user);
        
        if (user && user.email) {
          console.log('📧 Sending delivered email...');
          
          const { sendOrderDeliveredEmail } = require('../utils/emailService');
          
          const emailData = {
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            customerName: order.shippingAddress.name,
            customerEmail: user.email,
            orderItems: order.orderItems,
            totalPrice: order.totalPrice,
            deliveredDate: order.deliveredAt
          };
          
          console.log("📦 Email data prepared:", {
            orderNumber: emailData.orderNumber,
            customerEmail: emailData.customerEmail,
            deliveredDate: emailData.deliveredDate
          });
          
          const emailResult = await sendOrderDeliveredEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Delivered email sent from delivery status update');
          } else {
            console.error('❌ Failed to send delivered email:', emailResult.error);
          }
        } else {
          console.log("❌ User not found or no email address");
        }
      } catch (emailError) {
        console.error('❌ Email error in delivery status update:', emailError);
      }
    } else if (isDelivered && wasDelivered) {
      console.log('📧 Order was already delivered, no email sent');
    } else {
      console.log('📧 Order unmarked as delivered, no email sent');
    }

    res.json({
      message: 'Order delivery status updated successfully',
      order: {
        _id: order._id,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        status: order.status
      }
    });

  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/orders/:id/loyalty-stamp', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.loyaltyStampAdded) return res.status(400).json({ message: "Order already stamped or not found" });

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

// Get all return requests
router.get('/returns', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    const filter = { returnStatus: { $ne: null } };
    if (status !== 'all') {
      filter.returnStatus = status;
    }

    const returns = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .sort({ returnRequestedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalReturns = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalReturns / limit);

    // Get return stats
    const returnStats = await Order.aggregate([
      { $match: { returnStatus: { $ne: null } } },
      { $group: { _id: '$returnStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      returns,
      currentPage: parseInt(page),
      totalPages,
      totalReturns,
      returnStats,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update return status
router.put('/orders/:id/return-status', [auth, admin], async (req, res) => {
  try {
    const { returnStatus, notes } = req.body;
    
    console.log('=== UPDATING RETURN STATUS ===');
    console.log('Order ID:', req.params.id);
    console.log('New Return Status:', returnStatus);

    const validStatuses = ['requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'refund_processing', 'refund_completed'];
    if (!validStatuses.includes(returnStatus)) {
      return res.status(400).json({ 
        message: 'Invalid return status. Valid statuses are: ' + validStatuses.join(', ') 
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnStatus) {
      return res.status(400).json({ message: 'No return request found for this order' });
    }

    // 🔥 ADD: Capture old status for email logic
    const oldReturnStatus = order.returnStatus;

    // Update return status with timestamps
    order.returnStatus = returnStatus;
    
    switch (returnStatus) {
      case 'approved':
        order.returnApprovedAt = new Date();
        break;
      case 'rejected':
        order.returnRejectedAt = new Date();
        break;
      case 'pickup_scheduled':
        order.returnPickupScheduledAt = new Date();
        break;
      case 'picked_up':
        order.returnPickedUpAt = new Date();
        break;
      case 'refund_processing':
        order.refundStatus = 'processing';
        order.refundInitiatedAt = new Date();
        break;
      case 'refund_completed':
        order.refundStatus = 'completed';
        order.refundCompletedAt = new Date();
        order.status = 'returned';
        break;
    }

    if (notes) {
      order.refundNotes = notes;
    }

    await order.save();
    console.log('✅ Return status updated successfully');

    // 🔥 NEW: Send emails based on status change
    try {
      const User = require('../models/user');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        const emailData = {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.shippingAddress.name,
          customerEmail: user.email,
          orderItems: order.orderItems,
          returnReason: order.returnReason,
          totalRefundAmount: order.totalPrice
        };

        // Send appropriate email based on new status
        if (returnStatus === 'approved' && oldReturnStatus !== 'approved') {
          console.log('📧 Sending return approved email...');
          emailData.approvalDate = order.returnApprovedAt;
          
          const emailResult = await sendReturnApprovedEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Return approved email sent successfully');
          } else {
            console.error('❌ Failed to send return approved email:', emailResult.error);
          }
        }

        if (returnStatus === 'rejected' && oldReturnStatus !== 'rejected') {
          console.log('📧 Sending return rejected email...');
          emailData.rejectionReason = notes || 'Please contact support for details';
          emailData.rejectionDate = order.returnRejectedAt;
          
          const emailResult = await sendReturnRejectedEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Return rejected email sent successfully');
          } else {
            console.error('❌ Failed to send return rejected email:', emailResult.error);
          }
        }

        if (returnStatus === 'picked_up' && oldReturnStatus !== 'picked_up') {
          console.log('📧 Sending return picked up email...');
          emailData.pickupDate = order.returnPickedUpAt;
          emailData.expectedRefundDays = '5-7';
          
          const emailResult = await sendReturnPickedUpEmail(emailData);
          if (emailResult.success) {
            console.log('✅ Return picked up email sent successfully');
          } else {
            console.error('❌ Failed to send return picked up email:', emailResult.error);
          }
        }

      } else {
        console.log("❌ User not found or no email address");
      }
    } catch (emailError) {
      console.error('❌ Email error in return status update:', emailError);
    }

    res.json({
      message: 'Return status updated successfully',
      order: {
        _id: order._id,
        returnStatus: order.returnStatus,
        refundStatus: order.refundStatus,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error updating return status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Process refund
router.put('/orders/:id/process-refund', [auth, admin], async (req, res) => {
  try {
    const { refundAmount, refundMethod, transactionId, notes } = req.body;
    
    console.log('=== PROCESSING REFUND ===');
    console.log('Order ID:', req.params.id);
    console.log('Refund Amount:', refundAmount);

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnStatus || order.returnStatus !== 'picked_up') {
      return res.status(400).json({ 
        message: 'Order must be picked up before processing refund' 
      });
    }

    // Validate refund amount
    if (!refundAmount || refundAmount <= 0 || refundAmount > order.totalPrice) {
      return res.status(400).json({ 
        message: 'Invalid refund amount' 
      });
    }

    // Update refund information
    order.refundAmount = refundAmount;
    order.refundMethod = refundMethod || 'original_payment';
    order.refundStatus = 'processing';
    order.refundInitiatedAt = new Date();
    order.refundTransactionId = transactionId;
    order.refundNotes = notes;
    order.returnStatus = 'refund_processing';

    await order.save();
    console.log('✅ Refund initiated successfully');

    // 🔥 NEW: Send refund processing email
    try {
      const User = require('../models/user');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        console.log('📧 Sending refund processing email...');
        
        const refundEmailData = {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.shippingAddress.name,
          customerEmail: user.email,
          refundAmount: refundAmount,
          refundMethod: refundMethod || 'Original Payment Method',
          processingDate: order.refundInitiatedAt,
          expectedCompletionDays: '3-5',
          transactionId: transactionId
        };
        
        const emailResult = await sendRefundProcessingEmail(refundEmailData);
        if (emailResult.success) {
          console.log('✅ Refund processing email sent successfully');
        } else {
          console.error('❌ Failed to send refund processing email:', emailResult.error);
        }
      }
    } catch (emailError) {
      console.error('❌ Email error in refund processing:', emailError);
    }

    res.json({
      message: 'Refund initiated successfully',
      refundInfo: {
        amount: order.refundAmount,
        method: order.refundMethod,
        status: order.refundStatus,
        transactionId: order.refundTransactionId
      }
    });

  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update your existing complete refund route
router.put('/orders/:id/complete-refund', [auth, admin], async (req, res) => {
  try {
    const { transactionId, notes } = req.body;
    
    console.log('=== COMPLETING REFUND ===');
    console.log('Order ID:', req.params.id);

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.refundStatus !== 'processing') {
      return res.status(400).json({ 
        message: 'Refund must be in processing status to complete' 
      });
    }

    // Complete refund
    order.refundStatus = 'completed';
    order.refundCompletedAt = new Date();
    order.returnStatus = 'refund_completed';
    order.status = 'returned';
    
    if (transactionId) {
      order.refundTransactionId = transactionId;
    }
    
    if (notes) {
      order.refundNotes = notes;
    }

    await order.save();
    console.log('✅ Refund completed successfully');

    // 🔥 FIXED: Send refund completed email with proper refundAmount
    try {
      const User = require('../models/user');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        console.log('📧 Sending refund completed email...');
        
        const refundEmailData = {
          orderNumber: order._id.toString().slice(-8).toUpperCase(),
          customerName: order.shippingAddress.name,
          customerEmail: user.email,
          refundAmount: order.refundAmount || order.totalPrice, // 🔥 FIX: Use order.refundAmount or fallback to totalPrice
          refundMethod: order.refundMethod || 'Original Payment Method',
          completionDate: order.refundCompletedAt,
          transactionId: order.refundTransactionId || 'N/A',
          bankProcessingNote: 'The refund has been processed successfully. Please allow 1-2 business days for it to reflect in your account.'
        };
        
        // 🔥 DEBUG: Log the refund amount being used
        console.log('📦 Refund email data:', {
          orderNumber: refundEmailData.orderNumber,
          refundAmount: refundEmailData.refundAmount,
          customerEmail: refundEmailData.customerEmail
        });
        
        const emailResult = await sendRefundCompletedEmail(refundEmailData);
        if (emailResult.success) {
          console.log('✅ Refund completed email sent successfully');
        } else {
          console.error('❌ Failed to send refund completed email:', emailResult.error);
        }
      }
    } catch (emailError) {
      console.error('❌ Email error in refund completion:', emailError);
    }

    res.json({
      message: 'Refund completed successfully',
      refundInfo: {
        amount: order.refundAmount || order.totalPrice,
        status: order.refundStatus,
        completedAt: order.refundCompletedAt,
        transactionId: order.refundTransactionId
      }
    });

  } catch (error) {
    console.error('❌ Error completing refund:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get return details
router.get('/orders/:id/return-details', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnStatus) {
      return res.status(404).json({ message: 'No return request found for this order' });
    }
    
    res.json({
      order,
      returnInfo: {
        status: order.returnStatus,
        reason: order.returnReason,
        details: order.returnDetails,
        requestedAt: order.returnRequestedAt,
        approvedAt: order.returnApprovedAt,
        rejectedAt: order.returnRejectedAt,
        pickupScheduledAt: order.returnPickupScheduledAt,
        pickedUpAt: order.returnPickedUpAt
      },
      refundInfo: {
        amount: order.refundAmount,
        method: order.refundMethod,
        status: order.refundStatus,
        initiatedAt: order.refundInitiatedAt,
        completedAt: order.refundCompletedAt,
        transactionId: order.refundTransactionId,
        notes: order.refundNotes
      }
    });
  } catch (error) {
    console.error('Error fetching return details:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get order details (admin)
router.get('/orders/:id', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
