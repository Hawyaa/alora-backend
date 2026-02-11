const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// POST /api/cart/sync - Sync cart with backend
router.post('/sync', auth, async (req, res) => {
  try {
    console.log('🛒 CART SYNC REQUEST ============');
    console.log('User ID:', req.user?.userId || 'No user');
    console.log('Items to sync:', req.body.items);
    
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to sync cart'
      });
    }
    
    const { items } = req.body;
    
    // Validate items
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    // Find existing cart or create new one
    let cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      console.log('🆕 Creating new cart for user');
      cart = new Cart({
        user: req.user.userId,
        items: items || []
      });
    } else {
      console.log('🔄 Updating existing cart');
      cart.items = items || [];
      cart.updatedAt = new Date();
    }
    
    await cart.save();
    console.log('✅ Cart saved successfully');
    
    res.json({
      success: true,
      message: 'Cart synced successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.items.length,
        updatedAt: cart.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Cart sync error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
});

// GET /api/cart - Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      // Return empty cart if not found
      return res.json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          totalAmount: 0
        }
      });
    }
    
    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount,
        updatedAt: cart.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

module.exports = router;