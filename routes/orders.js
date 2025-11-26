const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Get single order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.user._id 
    }).populate('items.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order',
      error: error.message 
    });
  }
});

module.exports = router;