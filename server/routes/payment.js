const express = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = express.Router();

// Create order with COD only
router.post('/cod-order', auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Validate shipping fields
    const requiredFields = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    const missingFields = requiredFields.filter(f => !shippingAddress[f]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required shipping fields: ${missingFields.join(', ')}`
      });
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingAddress.phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    // Create and save the order
    const order = new Order({
      user: req.userId,
      orderItems,
      shippingAddress: {
        name: shippingAddress.name.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zipCode: shippingAddress.zipCode.trim(),
        country: shippingAddress.country.trim(),
      },
      paymentMethod: 'cod',
      totalPrice,
      couponCode: couponCode || null,  // Save coupon code if provided
      isPaid: false,
      status: 'pending',
    });

    const savedOrder = await order.save();

    // If a couponCode was used, mark it as 'used' ONLY AFTER confirming order is created,
    // This ensures coupon remains valid until order is placed.
    if (couponCode) {
      const User = require('../models/user'); // safely import User model
      const user = await User.findById(req.userId);

      if (user && user.loyalty && Array.isArray(user.loyalty.claimedCoupons)) {
        const idx = user.loyalty.claimedCoupons.findIndex(c => c.code === couponCode && !c.usedAt);
        if (idx !== -1) {
          user.loyalty.claimedCoupons[idx].usedAt = new Date();
          await user.save();
          console.log(`Coupon ${couponCode} marked as used for user ${user._id}`);
        }
      }
    }

    console.log('✅ COD Order created:', savedOrder._id);
    console.log('Customer details:', {
      name: savedOrder.shippingAddress.name,
      phone: savedOrder.shippingAddress.phone,
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('COD Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
