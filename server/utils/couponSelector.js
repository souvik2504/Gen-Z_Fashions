// server/utils/couponSelector.js
const { couponPools, rarityChances, rarityDisplay } = require('../config/couponPools');

// Generate random coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GZ${code}`; // GZ prefix for Gen-Z Fashion
};

// 🔥 NEW: Select rarity with adjusted chances for loyalty bonus
const selectRarity = (adjustedChances = rarityChances) => {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, chance] of Object.entries(adjustedChances)) {
    cumulative += chance;
    if (random <= cumulative) {
      return rarity;
    }
  }
  
  return 'common'; // Fallback
};

// Select coupon from rarity pool using weights
const selectCouponFromPool = (pool) => {
  const totalWeight = pool.reduce((sum, coupon) => sum + coupon.weight, 0);
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const coupon of pool) {
    cumulative += coupon.weight;
    if (random <= cumulative) {
      return coupon;
    }
  }
  
  return pool[0]; // Fallback to first coupon
};

// 🔥 UPDATED: Main function to get random coupon with loyalty bonus
const getRandomCoupon = (userStats = {}) => {
  console.log('🎲 Rolling for coupon rarity...');
  
  // 🔥 NEW: Apply loyalty bonus - better rates for loyalty program users
  let adjustedRarityChances = { ...rarityChances };
  
  if (userStats.loyaltyBonus && userStats.loyaltyLevel) {
    console.log('🏆 Applying loyalty bonus for level:', userStats.loyaltyLevel);
    
    switch (userStats.loyaltyLevel) {
      case 'Bronze':
        // Bronze: +5% uncommon, -5% common
        adjustedRarityChances.uncommon += 5;
        adjustedRarityChances.common -= 5;
        console.log('🥉 Bronze bonus: +5% uncommon chance');
        break;
        
      case 'Silver':
        // Silver: +3% rare, +5% uncommon, -8% common
        adjustedRarityChances.rare += 3;
        adjustedRarityChances.uncommon += 5;
        adjustedRarityChances.common -= 8;
        console.log('🥈 Silver bonus: +3% rare, +5% uncommon chance');
        break;
        
      case 'Gold':
        // Gold: +1% epic, +5% rare, -6% common
        adjustedRarityChances.epic += 1;
        adjustedRarityChances.rare += 5;
        adjustedRarityChances.common -= 6;
        console.log('🥇 Gold bonus: +1% epic, +5% rare chance');
        break;
        
      case 'Platinum':
        // Platinum: +0.5% legendary, +2% epic, +5% rare, -7.5% common
        adjustedRarityChances.legendary += 0.5;
        adjustedRarityChances.epic += 2;
        adjustedRarityChances.rare += 5;
        adjustedRarityChances.common -= 7.5;
        console.log('💎 Platinum bonus: +0.5% legendary, +2% epic, +5% rare chance');
        break;
        
      default:
        console.log('ℹ️ No loyalty bonus applied - unknown level:', userStats.loyaltyLevel);
    }
    
    // Log the adjusted chances
    console.log('📊 Adjusted rarity chances:', adjustedRarityChances);
  }
  
  // 🔥 UPDATED: Select rarity using adjusted chances
  const rarity = selectRarity(adjustedRarityChances);
  console.log(`🎯 Selected rarity: ${rarity.toUpperCase()}`);
  
  // Get coupon pool for selected rarity
  const pool = couponPools[rarity];
  if (!pool || pool.length === 0) {
    console.log('⚠️ No coupons in pool, falling back to common');
    return getRandomCoupon({ ...userStats, loyaltyBonus: false }); // Recursive fallback without bonus
  }
  
  // Select specific coupon from pool
  const selectedCoupon = selectCouponFromPool(pool);
  
  // Generate coupon data
  const couponData = {
    code: generateCouponCode(),
    description: selectedCoupon.description,
    type: selectedCoupon.type,
    value: selectedCoupon.value,
    minOrder: selectedCoupon.minOrder || 0,
    maxItems: selectedCoupon.maxItems,
    minItems: selectedCoupon.minItems,
    specialType: selectedCoupon.specialType,
    rarity: rarity,
    rarityDisplay: rarityDisplay[rarity],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
    // 🔥 NEW: Track if loyalty bonus was applied
    loyaltyBonusApplied: userStats.loyaltyBonus && userStats.loyaltyLevel
  };
  
  console.log('✅ Generated coupon:', {
    code: couponData.code,
    rarity: rarity,
    description: selectedCoupon.description,
    value: selectedCoupon.value,
    loyaltyBonus: couponData.loyaltyBonusApplied ? userStats.loyaltyLevel : 'none'
  });
  
  return couponData;
};

// 🔥 ENHANCED: Anti-frustration system with loyalty consideration
const getRandomCouponWithPity = (userStats = {}) => {
  const { 
    commonStreak = 0, 
    totalGifts = 0, 
    lastRareGift = 0,
    isFirstTime = false,
    loyaltyLevel = null
  } = userStats;
  
  let forcedRarity = null;
  
  // 🔥 NEW: First-time user gets boosted rates
  if (isFirstTime) {
    console.log('🎁 First-time user - boosting rare chances');
    
    const boostedChances = {
      ...rarityChances,
      common: 50,    // Reduced from 70%
      uncommon: 30,  // Increased from 20%
      rare: 15,      // Increased from 8%
      epic: 4,       // Increased from 1.8%
      legendary: 1   // Increased from 0.2%
    };
    
    const rarity = selectRarity(boostedChances);
    const pool = couponPools[rarity];
    const selectedCoupon = selectCouponFromPool(pool);
    
    return {
      ...getRandomCoupon(userStats),
      rarity,
      rarityDisplay: rarityDisplay[rarity],
      firstTimeBonusApplied: true
    };
  }
  
  // 🔥 ENHANCED: Pity timer with loyalty consideration
  if (commonStreak >= 5) {
    console.log('🍀 Pity timer activated - guaranteeing uncommon+');
    
    // Loyalty members get better pity rewards
    if (loyaltyLevel === 'Platinum' || loyaltyLevel === 'Gold') {
      forcedRarity = 'rare'; // Force rare or better
    } else {
      forcedRarity = 'uncommon'; // Force uncommon or better
    }
  }
  
  if (totalGifts - lastRareGift >= 10) {
    console.log('🎯 Long streak protection - guaranteeing rare+');
    
    // High loyalty members get epic guarantee
    if (loyaltyLevel === 'Platinum') {
      forcedRarity = 'epic';
    } else {
      forcedRarity = 'rare';
    }
  }
  
  // 🔥 NEW: Apply forced rarity if needed
  if (forcedRarity) {
    console.log(`🎲 Forcing rarity: ${forcedRarity.toUpperCase()}`);
    
    const pool = couponPools[forcedRarity];
    const selectedCoupon = selectCouponFromPool(pool);
    
    return {
      code: generateCouponCode(),
      description: selectedCoupon.description,
      type: selectedCoupon.type,
      value: selectedCoupon.value,
      minOrder: selectedCoupon.minOrder || 0,
      maxItems: selectedCoupon.maxItems,
      minItems: selectedCoupon.minItems,
      specialType: selectedCoupon.specialType,
      rarity: forcedRarity,
      rarityDisplay: rarityDisplay[forcedRarity],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      pityTimerApplied: true,
      loyaltyBonusApplied: userStats.loyaltyBonus && userStats.loyaltyLevel
    };
  }
  
  // No pity needed, use regular system
  return getRandomCoupon(userStats);
};

// 🔥 NEW: Function to get loyalty bonus summary for display
const getLoyaltyBonusSummary = (loyaltyLevel) => {
  const bonuses = {
    Bronze: {
      uncommon: '+5%',
      description: 'Better chance at uncommon coupons'
    },
    Silver: {
      uncommon: '+5%',
      rare: '+3%',
      description: 'Better chance at uncommon and rare coupons'
    },
    Gold: {
      rare: '+5%',
      epic: '+1%',
      description: 'Better chance at rare and epic coupons'
    },
    Platinum: {
      rare: '+5%',
      epic: '+2%',
      legendary: '+0.5%',
      description: 'Significantly better chance at all premium coupons'
    }
  };
  
  return bonuses[loyaltyLevel] || null;
};

// 🔥 NEW: Test function to validate loyalty bonus distribution
const testLoyaltyBonus = (loyaltyLevel, iterations = 1000) => {
  console.log(`🧪 Testing loyalty bonus for ${loyaltyLevel} with ${iterations} iterations...`);
  
  const results = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };
  
  for (let i = 0; i < iterations; i++) {
    const coupon = getRandomCoupon({
      loyaltyBonus: true,
      loyaltyLevel: loyaltyLevel
    });
    results[coupon.rarity]++;
  }
  
  console.log(`\n📊 ${loyaltyLevel} Results:`);
  Object.entries(results).forEach(([rarity, count]) => {
    const percentage = ((count / iterations) * 100).toFixed(2);
    console.log(`${rarity.toUpperCase()}: ${count} (${percentage}%)`);
  });
  
  return results;
};

module.exports = {
  getRandomCoupon,
  getRandomCouponWithPity,
  generateCouponCode,
  rarityDisplay,
  getLoyaltyBonusSummary, // 🔥 NEW
  testLoyaltyBonus        // 🔥 NEW
};
