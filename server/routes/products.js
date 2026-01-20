const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get all products
// In server/routes/products.js
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      page = 1, 
      limit = 12, 
      featured,
      sortBy, // Frontend sends this
      sort    // Fallback if frontend sends this
    } = req.query;

    // 🔥 USE: sortBy or fall back to sort parameter
    const sortParam = sortBy || sort || 'newest';
    
    console.log('🔍 Products API called with:', { 
      category, 
      search, 
      page, 
      sortParam,
      originalSort: sort,
      originalSortBy: sortBy 
    });

    const query = {};

    // Category filter
    if (category) query.category = category;

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // 🔥 BUILD: Sort object based on sortParam
    let sortObject = {};
    switch (sortParam) {
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'price-low':
        sortObject = { price: 1 }; // Low to High
        break;
      case 'price-high':
        sortObject = { price: -1 }; // High to Low
        break;
      case 'name':
        sortObject = { name: 1 }; // A-Z
        break;
      case 'name-desc':
        sortObject = { name: -1 }; // Z-A
        break;
      default:
        sortObject = { createdAt: -1 }; // Default to newest
    }

    console.log('🔄 Using sort object:', sortObject);

    // Fetch products with sorting
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObject); // 🔥 Apply sorting

    const total = await Product.countDocuments(query);

    console.log(`✅ Found ${products.length} products with sort: ${sortParam}`);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      sortBy: sortParam // Return the sort parameter used
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/featured', async (req, res) => {
  try {
    console.log('🔍 Featured products endpoint called');
    const limit = parseInt(req.query.limit) || 8;
    
    const featuredProducts = await Product.find({ 
      featured: true  // Make sure this matches your field name
    })
    .limit(limit)
    .sort({ createdAt: -1 });

    console.log('📊 Found featured products:', featuredProducts.length);
    console.log('📦 Products:', featuredProducts.map(p => ({ name: p.name, isFeatured: p.featured })));

    res.json(featuredProducts);
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    console.log('Related products requested for product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // console.log('Found product:', product.name, 'Category:', product.category);

    // Find similar products based on category and exclude current product
    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id }, // Exclude current product
      category: product.category    // Same category
    })
    .limit(8) // Limit to 8 products
    .sort({ createdAt: -1 }); // Sort by newest

    // console.log(`Found ${relatedProducts.length} related products`);
    res.json(relatedProducts);
  } catch (error) {
    console.error('Related products error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
