const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const claimedCouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  surprise: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  appliedAt: Date,
  usedAt: Date // null if never used
});

const loyaltyHistorySchema = new mongoose.Schema({
  cycle: { type: Number, required: true },
  rewardType: { type: String, required: true },
  code: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now }
});


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Make password optional for Google users
  },
  phone: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileAddress: {
    type: String,
    default: ''
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    size: String,
    color: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: Number,
    image: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  loyalty: {
    stamps: { type: Number, default: 0 }, // Number of t-shirts filled this cycle (max 10)
    cyclesCompleted: { type: Number, default: 0 }, // Total full cycles completed
    loyaltyLevel: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    claimedCoupons: [claimedCouponSchema], // List of coupons user claimed
    loyaltyHistory: [loyaltyHistorySchema], // Historical record of claims
    hasReceivedWelcomeCoupon: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  // Only hash password if it exists and is modified
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false; // No password set for Google users
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
