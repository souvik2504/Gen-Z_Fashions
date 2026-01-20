const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['men', 'women', 'unisex', 'kids']
  },
  
  // 🔥 NEW: Replace sizes and colors with variants
  variants: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    color: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  }],
  
  // 🔥 ADD: Helper arrays for easier filtering (auto-generated from variants)
  availableColors: [{
    type: String
  }],
  availableSizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],  
  images: [String],
  featured: {
    type: Boolean,
    default: false
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviewStats: {
    fiveStar: { type: Number, default: 0 },
    fourStar: { type: Number, default: 0 },
    threeStar: { type: Number, default: 0 },
    twoStar: { type: Number, default: 0 },
    oneStar: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// 🔥 ADD: Pre-save middleware to auto-generate helper arrays
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    // Extract unique colors and sizes from variants
    this.availableColors = [...new Set(this.variants.map(v => v.color))];
    this.availableSizes = [...new Set(this.variants.map(v => v.size))];
  }
  next();
});

// 🔥 ADD: Instance method to get stock for specific variant
productSchema.methods.getVariantStock = function(size, color) {
  const variant = this.variants.find(v => v.size === size && v.color === color);
  return variant ? variant.stock : 0;
};

// 🔥 ADD: Instance method to check if specific variant exists
productSchema.methods.hasVariant = function(size, color) {
  return this.variants.some(v => v.size === size && v.color === color);
};

// 🔥 ADD: Instance method to get all variants for a specific color
productSchema.methods.getVariantsByColor = function(color) {
  return this.variants.filter(v => v.color === color);
};

// 🔥 ADD: Instance method to get all variants for a specific size
productSchema.methods.getVariantsBySize = function(size) {
  return this.variants.filter(v => v.size === size);
};

// 🔥 ADD: Instance method to check if any variant is in stock
productSchema.methods.hasAnyStock = function() {
  return this.variants.some(v => v.stock > 0);
};

// 🔥 ADD: Instance method to get total stock across all variants
productSchema.methods.getTotalStock = function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
};

module.exports = mongoose.model('Product', productSchema);
