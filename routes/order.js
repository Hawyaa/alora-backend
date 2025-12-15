const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// POST /api/orders/checkout - Create new order
router.post('/checkout', async (req, res) => {
  try {
    console.log('🛒 CHECKOUT REQUEST RECEIVED ============');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { items, paymentMethod, deliveryAddress, notes, customerInfo } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ No items in order');
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    // Log each item for debugging
    console.log('📦 Items received:', items.length);
    items.forEach((item, index) => {
      console.log(`  Item ${index + 1}:`, {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
    });
    
    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + shipping + tax;
    
    console.log('💰 Calculations:', {
      subtotal,
      shipping,
      tax,
      totalAmount
    });
    
    // Create order - FIX: Handle productId conversion
    const orderData = {
      items: items.map(item => {
        // Try to convert productId to ObjectId if it's a valid format
        let productId = null;
        try {
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            productId = new mongoose.Types.ObjectId(item.productId);
          } else {
            console.log(`⚠️ Invalid ObjectId for product: ${item.productId}, using null`);
          }
        } catch (error) {
          console.log(`⚠️ Could not convert productId: ${item.productId}`, error.message);
        }
        
        return {
          product: productId, // This can be null for guest orders
          productId: item.productId, // Keep original ID as string
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          shade: item.shade || 'default'
        };
      }),
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      deliveryAddress: deliveryAddress || {},
      customerInfo: customerInfo || {},
      notes: notes || ''
    };
    
    // Add user reference if token exists in headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        orderData.user = decoded.userId;
        console.log('👤 Order linked to user:', decoded.userId);
      } catch (authError) {
        console.log('⚠️ Token verification failed, creating guest order');
      }
    } else {
      console.log('👤 Guest checkout (no token)');
    }
    
    console.log('📝 Final order data:', JSON.stringify(orderData, null, 2));
    
    // Save order
    console.log('💾 Saving order to database...');
    const order = new Order(orderData);
    await order.save();
    
    console.log('✅ Order saved successfully!');
    console.log('📋 Order ID:', order._id);
    console.log('📋 Order number (if exists):', order.orderNumber);
    
    res.json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },
      orderId: order._id
    });
    
    console.log('✅ CHECKOUT COMPLETE ============\n');
    
  } catch (error) {
    console.error('❌ ORDER CREATION ERROR ============');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error('Mongoose Validation Error:', error.errors);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place order',
      error: error.message,
      errorType: error.name
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user && order.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

module.exports = router;