const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/product');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.userId })
      .populate('product', 'name price originalPrice images colors sizes')
      .sort({ createdAt: -1 });
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.userId,
      product: productId
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.userId,
      product: productId
    });

    await wishlistItem.save();
    await wishlistItem.populate('product', 'name price originalPrice images colors sizes');

    res.status(201).json({
      message: 'Item added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedItem = await Wishlist.findOneAndDelete({
      user: req.userId,
      product: productId
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove item from wishlist' });
  }
});

// Check if item is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlistItem = await Wishlist.findOne({
      user: req.userId,
      product: productId
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Failed to check wishlist status' });
  }
});

module.exports = router;
