const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const generateCouponCode = require('../utils/generateCouponCode');
const Surprise = require('../models/Surprise');
const { getRandomCoupon, rarityDisplay } = require('../utils/couponSelector'); // 🔥 NEW: Import rarity system

// Helper to calculate loyalty level based on cyclesCompleted
function calculateLoyaltyLevel(cycles) {
  if (cycles >= 30) return 'Platinum';
  if (cycles >= 10) return 'Gold';
  if (cycles >= 5) return 'Silver';
  return 'Bronze';
}

// GET /api/loyalty/status - get user loyalty status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('loyalty');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔥 FIXED: Remove duplicate claimedCoupons key and filter properly
    const validCoupons = user.loyalty.claimedCoupons?.filter(coupon => {
      return !coupon.usedAt && new Date(coupon.expiresAt) > new Date();
    }) || [];

    res.json({
      stamps: user.loyalty.stamps,
      cyclesCompleted: user.loyalty.cyclesCompleted,
      loyaltyLevel: user.loyalty.loyaltyLevel,
      claimedCoupons: validCoupons, // Only valid (unused & not expired) coupons
      canClaim: user.loyalty.stamps >= 10 // 🔥 NEW: Helper for frontend
    });
  } catch (error) {
    console.error('Error fetching loyalty status:', error);
    res.status(500).json({ message: 'Failed to fetch loyalty status' });
  }
});

// POST /api/loyalty/stamp - add one stamp if purchase eligible
router.post('/stamp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.loyalty.stamps >= 10) {
      return res.status(400).json({ message: 'Loyalty card already full. Please claim surprise.' });
    }

    user.loyalty.stamps += 1;

    await user.save();

    console.log(`📸 Stamp added for user ${req.userId}. Total stamps: ${user.loyalty.stamps}`);

    res.json({ 
      message: 'Stamp added', 
      stamps: user.loyalty.stamps,
      canClaim: user.loyalty.stamps >= 10 // 🔥 NEW: Tell frontend if ready to claim
    });
  } catch (error) {
    console.error('Error adding loyalty stamp:', error);
    res.status(500).json({ message: 'Failed to add loyalty stamp' });
  }
});

// 🔥 UPDATED: POST /api/loyalty/claim - claim surprise with rarity system
router.post('/claim', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.loyalty.stamps < 10) {
      return res.status(400).json({ message: 'Not enough stamps to claim surprise' });
    }

    console.log('🎁 User claiming loyalty surprise:', req.userId);

    // 🔥 NEW: Use rarity system instead of random surprise selection
    const userStats = {
      totalGifts: user.loyalty.cyclesCompleted || 0,
      loyaltyLevel: user.loyalty.loyaltyLevel,
      isFirstTime: !user.loyalty.cyclesCompleted || user.loyalty.cyclesCompleted === 0,
      // 🔥 BONUS: Loyalty users get slightly better rates
      loyaltyBonus: true
    };

    // Generate random coupon with rarity system
    const couponData = getRandomCoupon(userStats);

    // 🔥 NEW: Enhanced coupon object with rarity info
    const couponCode = couponData.code; // Use generated code from rarity system
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 20); // 🔥 CHANGED: 20 days validity (was 1 month)

    // Add coupon to user's claimed coupons with full rarity data
    const newCoupon = {
      code: couponCode,
      description: couponData.description,
      surprise: couponData.description, // For backward compatibility  
      type: couponData.type, // 🔥 NEW: percentage/fixed
      value: couponData.value, // 🔥 NEW: discount value
      minOrder: couponData.minOrder || 0, // 🔥 NEW: minimum order requirement
      maxItems: couponData.maxItems, // 🔥 NEW: maximum items (if applicable)
      minItems: couponData.minItems, // 🔥 NEW: minimum items (if applicable)
      specialType: couponData.specialType, // 🔥 NEW: special offer type
      rarity: couponData.rarity, // 🔥 NEW: rarity level
      claimedAt: now,
      expiresAt: expiresAt,
      source: 'loyalty_claim' // 🔥 NEW: Track source
    };

    // Initialize claimedCoupons array if it doesn't exist
    if (!user.loyalty.claimedCoupons) {
      user.loyalty.claimedCoupons = [];
    }

    user.loyalty.claimedCoupons.push(newCoupon);

    // Update loyalty progress
    user.loyalty.cyclesCompleted += 1;
    user.loyalty.stamps = 0;
    user.loyalty.loyaltyLevel = calculateLoyaltyLevel(user.loyalty.cyclesCompleted);

    // 🔥 ENHANCED: Record in loyalty history with rarity info
    if (!user.loyalty.loyaltyHistory) {
      user.loyalty.loyaltyHistory = [];
    }

    user.loyalty.loyaltyHistory.push({
      cycle: user.loyalty.cyclesCompleted,
      rewardType: couponData.description,
      code: couponCode,
      rarity: couponData.rarity, // 🔥 NEW: Track rarity in history
      claimedAt: now
    });

    await user.save();

    console.log('✅ Loyalty surprise claimed:', {
      userId: req.userId,
      couponCode: couponCode,
      rarity: couponData.rarity,
      description: couponData.description,
      cyclesCompleted: user.loyalty.cyclesCompleted
    });

    // 🔥 NEW: Return enhanced response with rarity information
    res.json({
      success: true,
      message: couponData.rarityDisplay.message, // Rarity-specific message
      coupon: {
        code: couponCode,
        description: couponData.description,
        type: couponData.type,
        value: couponData.value,
        minOrder: couponData.minOrder,
        expiresAt: expiresAt,
        rarity: couponData.rarity,
        rarityDisplay: couponData.rarityDisplay // 🔥 NEW: Frontend display info
      },
      loyalty: {
        loyaltyLevel: user.loyalty.loyaltyLevel,
        cyclesCompleted: user.loyalty.cyclesCompleted,
        stamps: user.loyalty.stamps
      },
      // 🔥 NEW: Animation and display data for frontend
      celebration: {
        rarity: couponData.rarity,
        rarityDisplay: couponData.rarityDisplay,
        isLevelUp: user.loyalty.cyclesCompleted === 5 || 
                   user.loyalty.cyclesCompleted === 10 || 
                   user.loyalty.cyclesCompleted === 30 // Show level up celebration
      }
    });

  } catch (error) {
    console.error('❌ Error claiming loyalty surprise:', error);
    res.status(500).json({ message: 'Failed to claim surprise' });
  }
});

// 🔥 NEW: GET /api/loyalty/history - get user's loyalty claim history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('loyalty.loyaltyHistory loyalty.cyclesCompleted');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const history = user.loyalty.loyaltyHistory || [];
    
    // Sort by most recent first
    const sortedHistory = history.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));

    res.json({
      history: sortedHistory,
      totalCycles: user.loyalty.cyclesCompleted || 0
    });

  } catch (error) {
    console.error('Error fetching loyalty history:', error);
    res.status(500).json({ message: 'Failed to fetch loyalty history' });
  }
});

module.exports = router;
