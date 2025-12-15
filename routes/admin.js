const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Test route
router.get('/test', auth, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: '✅ Admin access confirmed!',
    user: req.user
  });
});

// Get ALL customer carts
router.get('/carts', auth, isAdmin, async (req, res) => {
  try {
    console.log('📦 Admin: Fetching all customer carts');
    
    const carts = await Cart.find()
      .populate({
        path: 'user',
        select: 'name email phone',
        options: { lean: true }
      })
      .populate({
        path: 'items.product',
        select: 'name price images',
        options: { lean: true }
      })
      .sort({ updatedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${carts.length} carts`);
    
    res.json({
      success: true,
      count: carts.length,
      carts: carts
    });
    
  } catch (error) {
    console.error('❌ Admin carts error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get ALL customer orders
router.get('/orders', auth, isAdmin, async (req, res) => {
  try {
    console.log('📦 Admin: Fetching all customer orders');
    
    const orders = await Order.find()
      .populate({
        path: 'user',
        select: 'name email phone',
        options: { lean: true }
      })
      .populate({
        path: 'items.product',
        select: 'name price images',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} orders`);
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (error) {
    console.error('❌ Admin orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create a test order (for debugging)
router.post('/test-order', auth, isAdmin, async (req, res) => {
  try {
    // Check if there are any products in the database
    const Product = require('../models/Product');
    const products = await Product.find().limit(1);
    
    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No products found in database. Please add products first.'
      });
    }
    
    // Create a test order
    const order = new Order({
      user: req.user.id,
      items: [{
        product: products[0]._id,
        quantity: 2,
        price: 29.99,
        shade: { 
          name: 'Pink Blush', 
          code: '#FF69B4' 
        }
      }],
      totalAmount: 59.98,
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'pending'
    });
    
    await order.save();
    
    // Populate the order with user and product details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');
    
    res.json({
      success: true,
      message: 'Test order created successfully',
      order: populatedOrder
    });
    
  } catch (error) {
    console.error('❌ Test order error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get dashboard statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    console.log('📊 Admin: Fetching dashboard statistics');
    
    const [
      totalCarts,
      totalOrders,
      paidOrders,
      pendingOrders
    ] = await Promise.all([
      Cart.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'pending' })
    ]);
    
    // Calculate total revenue from paid orders
    const paidOrdersData = await Order.find({ status: 'paid' }, 'totalAmount');
    const totalRevenue = paidOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate total cart value
    const carts = await Cart.find().populate('items.product', 'price');
    const totalCartValue = carts.reduce((sum, cart) => {
      return sum + cart.items.reduce((cartSum, item) => {
        return cartSum + (item.price * item.quantity);
      }, 0);
    }, 0);
    
    res.json({
      success: true,
      stats: {
        totalCarts,
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCartValue: parseFloat(totalCartValue.toFixed(2))
      }
    });
    
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;