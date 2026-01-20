// Create file: server/routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/product');
const auth = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    console.log('📦 Fetching cart for user:', req.userId);
    
    let cart = await Cart.findOne({ user: req.userId }).populate('items.product', 'name images variants');
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }

    console.log('✅ Cart found with', cart.items.length, 'items');
    res.json(cart);
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    
    console.log('🛒 Adding to cart:', { productId, size, color, quantity, userId: req.userId });

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if variant exists and has sufficient stock
    const variant = product.variants.find(v => v.size === size && v.color === color);
    if (!variant) {
      return res.status(400).json({ message: 'Product variant not found' });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${variant.stock} items available in stock`,
        availableStock: variant.stock
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Prepare cart item data
    const cartItemData = {
      product: productId,
      name: product.name,
      price: product.price,
      size: size,
      color: color,
      quantity: parseInt(quantity),
      image: product.images[0] || '/placeholder-tshirt.jpg'
    };

    // Add item to cart
    cart.addItem(cartItemData);
    await cart.save();

    console.log('✅ Item added to cart. Total items:', cart.totalItems);
    
    // Return updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name images variants');
    res.json({
      message: 'Item added to cart successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/cart/update - Update item quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    
    console.log('🔄 Updating cart item:', { productId, size, color, quantity });

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check stock availability if increasing quantity
    if (quantity > 0) {
      const product = await Product.findById(productId);
      const variant = product?.variants.find(v => v.size === size && v.color === color);
      
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({ 
          message: `Only ${variant?.stock || 0} items available in stock`,
          availableStock: variant?.stock || 0
        });
      }
    }

    cart.updateQuantity(productId, size, color, quantity);
    await cart.save();

    console.log('✅ Cart updated. Total items:', cart.totalItems);
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name images variants');
    res.json({
      message: 'Cart updated successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId, size, color } = req.body;
    
    console.log('🗑️ Removing from cart:', { productId, size, color });

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.removeItem(productId, size, color);
    await cart.save();

    console.log('✅ Item removed from cart. Total items:', cart.totalItems);
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name images variants');
    res.json({
      message: 'Item removed from cart successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', auth, async (req, res) => {
  try {
    console.log('🧹 Clearing cart for user:', req.userId);

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.clearCart();
    await cart.save();

    console.log('✅ Cart cleared');
    res.json({
      message: 'Cart cleared successfully',
      cart: cart
    });

  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart/sync - Sync local cart with database cart
router.post('/sync', auth, async (req, res) => {
  try {
    const { localCartItems } = req.body;
    
    console.log('🔄 Syncing local cart with database for user:', req.userId);
    console.log('Local cart items:', localCartItems.length);

    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Merge local cart items with database cart
    for (const localItem of localCartItems) {
      // Verify product still exists and has stock
      const product = await Product.findById(localItem.product);
      if (!product) continue;

      const variant = product.variants.find(v => 
        v.size === localItem.size && v.color === localItem.color
      );
      if (!variant || variant.stock < localItem.quantity) continue;

      // Add to cart (will merge with existing items)
      const cartItemData = {
        product: localItem.product,
        name: product.name,
        price: product.price,
        size: localItem.size,
        color: localItem.color,
        quantity: localItem.quantity,
        image: product.images[0] || '/placeholder-tshirt.jpg'
      };

      cart.addItem(cartItemData);
    }

    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name images variants');
    
    console.log('✅ Cart synced. Total items:', updatedCart.totalItems);
    
    res.json({
      message: 'Cart synced successfully',
      cart: updatedCart
    });

  } catch (error) {
    console.error('❌ Error syncing cart:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
