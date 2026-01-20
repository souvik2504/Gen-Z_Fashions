const User = require('../models/User');
const generateCouponCode = require('./generateCouponCode');

async function grantWelcomeCoupon(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found for welcome coupon');
      return null;
    }

    // Check if user already received welcome coupon
    if (user.loyalty?.hasReceivedWelcomeCoupon) {
      console.log('User already received welcome coupon');
      return null;
    }

    // Initialize loyalty if not exists
    if (!user.loyalty) {
      user.loyalty = {
        stamps: 0,
        cyclesCompleted: 0,
        loyaltyLevel: 'Bronze',
        claimedCoupons: [],
        loyaltyHistory: [],
        hasReceivedWelcomeCoupon: false
      };
    }

    // Generate unique coupon code
    const couponCode = await generateCouponCode();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

    // Add welcome coupon
    user.loyalty.claimedCoupons.push({
      code: couponCode,
      surprise: '10% off on your first order',
      claimedAt: now,
      expiresAt
    });

    // Mark as received
    user.loyalty.hasReceivedWelcomeCoupon = true;

    await user.save();

    console.log(`✅ Welcome coupon ${couponCode} granted to user ${userId}`);

    return {
      code: couponCode,
      description: '10% off on your first order',
      expiresAt
    };

  } catch (error) {
    console.error('Error granting welcome coupon:', error);
    return null;
  }
}

module.exports = grantWelcomeCoupon;
