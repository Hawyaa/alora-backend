const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// POST /api/cart/sync - Sync cart with backend
router.post('/sync', auth, async (req, res) => {
  try {
    console.log('🛒 CART SYNC REQUEST ============');
    console.log('User ID:', req.user.userId);
    console.log('Items to sync:', req.body.items);
    
    const { items } = req.body;
    
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
      cart: cart
    });
    
  } catch (error) {
    console.error('❌ Cart sync error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
});

module.exports = router;