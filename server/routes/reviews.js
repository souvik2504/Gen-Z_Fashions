const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/product');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/reviews/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for review images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create review
router.post('/', [auth, upload.array('images', 3)], async (req, res) => {
  try {
    const { productId, orderId, orderItemId, rating, title, comment, size, color } = req.body;

    console.log('=== CREATING REVIEW ===');
    console.log('User:', req.userId);
    console.log('Request Body:', req.body);
    console.log('Files:', req.files?.length || 0);

    // Enhanced validation with detailed error messages
    if (!productId || productId === '[object Object]') {
      console.error('Invalid productId:', productId);
      return res.status(400).json({ message: 'Valid Product ID is required' });
    }
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    if (!orderItemId) {
      return res.status(400).json({ message: 'Order Item ID is required' });
    }
    
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Review title is required' });
    }
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Review comment is required' });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only review your own orders' });
    }

    if (!order.isDelivered) {
      return res.status(400).json({ message: 'You can only review delivered products' });
    }

    // Check if the order item exists in this order
    const orderItem = order.orderItems.find(item => item._id.toString() === orderItemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found in this order' });
    }

    // Validate product ID matches
    const orderItemProductId = typeof orderItem.product === 'string' 
      ? orderItem.product 
      : orderItem.product._id?.toString() || orderItem.product.toString();
    
    if (orderItemProductId !== productId) {
      console.error('Product ID mismatch:', { productId, orderItemProductId });
      return res.status(400).json({ message: 'Product ID does not match order item' });
    }

    // Check if user already reviewed this order item
    const existingReview = await Review.findOne({
      user: req.userId,
      orderItem: orderItemId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product from this order' });
    }

    // Create review
    const reviewData = {
      user: req.userId,
      product: productId,
      order: orderId,
      orderItem: orderItemId,
      rating: ratingNum,
      title: title.trim(),
      comment: comment.trim(),
      size: size || orderItem.size || 'N/A',
      color: color || orderItem.color || 'N/A',
      images: req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : []
    };

    console.log('Creating review with data:', reviewData);

    const review = new Review(reviewData);
    await review.save();

    // Update product with new review statistics
    await updateProductReviewStats(productId);

    // Populate user data for response
    await review.populate('user', 'name');

    console.log('✅ Review created successfully:', review._id);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('❌ Review creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product from this order' });
    }
    
    res.status(500).json({ 
      message: error.message || 'Internal server error while creating review'
    });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 }; // default: newest first
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { helpfulVotes: -1, createdAt: -1 };
        break;
    }

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort(sortOption)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ product: req.params.productId });

    res.json({
      reviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviewed items
router.get('/user-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId }).select('orderItem');
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark review as helpful
router.put('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already voted
    const hasVoted = review.votedBy.includes(req.userId);
    
    if (hasVoted) {
      // Remove vote
      review.votedBy = review.votedBy.filter(id => id.toString() !== req.userId);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add vote
      review.votedBy.push(req.userId);
      review.helpfulVotes += 1;
    }

    await review.save();

    res.json({
      message: hasVoted ? 'Vote removed' : 'Vote added',
      helpfulVotes: review.helpfulVotes,
      hasVoted: !hasVoted
    });

  } catch (error) {
    console.error('Error updating helpful votes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update product review statistics
async function updateProductReviewStats(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
        reviewStats: {
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0
        }
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const reviewStats = {
      fiveStar: reviews.filter(r => r.rating === 5).length,
      fourStar: reviews.filter(r => r.rating === 4).length,
      threeStar: reviews.filter(r => r.rating === 3).length,
      twoStar: reviews.filter(r => r.rating === 2).length,
      oneStar: reviews.filter(r => r.rating === 1).length
    };

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      numReviews: reviews.length,
      reviewStats
    });

    console.log(`✅ Updated review stats for product ${productId}: ${averageRating} (${reviews.length} reviews)`);

  } catch (error) {
    console.error('Error updating product review stats:', error);
  }
}

module.exports = router;
