// Create file: server/config/couponPools.js

const couponPools = {
  common: [
    {
      description: "10% off next order",
      type: "percentage",
      value: 10,
      weight: 35,
      minOrder: 0,
      dropRate: 25
    },
    {
      description: "20% off next order", 
      type: "percentage",
      value: 20,
      weight: 30,
      minOrder: 0,
      dropRate: 20
    },
    {
      description: "₹100 off next order",
      type: "fixed",
      value: 100,
      weight: 25,
      minOrder: 0,
      dropRate: 15
    },
    {
      description: "Buy 3 Get 1 Free (25% off)",
      type: "percentage", 
      value: 25,
      weight: 10,
      minOrder: 0,
      dropRate: 10,
      specialType: "buy3get1"
    }
  ],

  uncommon: [
    {
      description: "30% off on orders above ₹500",
      type: "percentage",
      value: 30,
      weight: 40,
      minOrder: 500,
      dropRate: 8
    },
    {
      description: "₹200 off on orders above ₹800",
      type: "fixed",
      value: 200,
      weight: 35,
      minOrder: 800,
      dropRate: 7
    },
    {
      description: "35% off on orders above ₹600",
      type: "percentage", 
      value: 35,
      weight: 15,
      minOrder: 600,
      dropRate: 3
    },
    {
      description: "Free shipping + 15% off",
      type: "percentage",
      value: 15,
      weight: 10,
      minOrder: 299,
      dropRate: 2,
      specialType: "freeShipping"
    }
  ],

  rare: [
    {
      description: "40% off on orders above ₹1000",
      type: "percentage",
      value: 40,
      weight: 37.5, // 3% of 8%
      minOrder: 1000,
      dropRate: 3
    },
    {
      description: "₹500 off on orders above ₹1800", 
      type: "fixed",
      value: 500,
      weight: 25, // 2% of 8%
      minOrder: 1800,
      dropRate: 2
    },
    {
      description: "Buy 2 Get 1 Free (50% off, min 4 items)",
      type: "percentage",
      value: 50,
      weight: 25, // 2% of 8% 
      minOrder: 0,
      dropRate: 2,
      specialType: "buy2get2",
      minItems: 4
    },
    {
      description: "45% off on orders above ₹1200",
      type: "percentage",
      value: 45,
      weight: 12.5, // 1% of 8%
      minOrder: 1200,
      dropRate: 1
    }
  ],

  epic: [
    {
      description: "60% off on orders above ₹1500",
      type: "percentage", 
      value: 60,
      weight: 55.6, // 1% of 1.8%
      minOrder: 1500,
      dropRate: 1
    },
    {
      description: "₹1000 off on orders above ₹3000",
      type: "fixed",
      value: 1000,
      weight: 27.8, // 0.5% of 1.8%
      minOrder: 3000,
      dropRate: 0.5
    },
    {
      description: "Buy 2 Get 1 Free (min 3 items)",
      type: "percentage",
      value: 66.67,
      weight: 16.7, // 0.3% of 1.8%
      minOrder: 0,
      dropRate: 0.3,
      specialType: "buy2get1",
      minItems: 3
    }
  ],

  legendary: [
    {
      description: "75% off on orders above ₹2000",
      type: "percentage",
      value: 75, 
      weight: 50, // 0.1% of 0.2%
      minOrder: 2000,
      dropRate: 0.1
    },
    {
      description: "₹2000 off on orders above ₹5000",
      type: "fixed",
      value: 2000,
      weight: 25, // 0.05% of 0.2%
      minOrder: 5000,
      dropRate: 0.05
    },
    {
      description: "90% off on orders above ₹2500 (max 5 items)",
      type: "percentage",
      value: 90,
      weight: 25, // 0.05% of 0.2%
      minOrder: 2500,
      dropRate: 0.05,
      maxItems: 5
    }
  ]
};

// Rarity chances (must sum to 100)
const rarityChances = {
  common: 70,      // 70%
  uncommon: 20,    // 20%
  rare: 8,         // 8%
  epic: 1.8,       // 1.8%
  legendary: 0.2   // 0.2%
};

// Rarity display data for frontend
const rarityDisplay = {
  common: {
    name: "Common",
    color: "#22c55e", // Green
    emoji: "🟢",
    glow: "green",
    message: "🎁 Nice! You got a discount!"
  },
  uncommon: {
    name: "Uncommon", 
    color: "#3b82f6", // Blue
    emoji: "🔵",
    glow: "blue",
    message: "✨ Great! An uncommon coupon!"
  },
  rare: {
    name: "Rare",
    color: "#8b5cf6", // Purple
    emoji: "🟣", 
    glow: "purple",
    message: "🌟 Awesome! A rare coupon appeared!"
  },
  epic: {
    name: "Epic",
    color: "#f97316", // Orange
    emoji: "🟠",
    glow: "orange", 
    message: "⚡ EPIC! This is amazing!"
  },
  legendary: {
    name: "Legendary",
    color: "#eab308", // Gold
    emoji: "🟡",
    glow: "gold",
    message: "🏆 LEGENDARY! You hit the jackpot!"
  }
};

module.exports = {
  couponPools,
  rarityChances,
  rarityDisplay
};
