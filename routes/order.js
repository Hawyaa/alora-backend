const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Only import the model ONCE
const Order = require('../models/Order');

// Helper function to check if string is valid MongoDB ObjectId
function isValidObjectId(id) {
  if (!id) return false;
  // Check if it's a 24-character hex string
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

// CHECKOUT ENDPOINT - Fixed version
router.post('/checkout', async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('🛒 CHECKOUT REQUEST RECEIVED AT:', new Date().toISOString());
  console.log('='.repeat(60));
  
  try {
    // Log incoming request
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    
    const { items, paymentMethod, deliveryAddress, customerInfo, notes } = req.body;
    
    // === VALIDATION ===
    if (!items || !Array.isArray(items)) {
      console.log('❌ No items array in request');
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }
    
    console.log(`📦 Items count: ${items.length}`);
    
    if (items.length === 0) {
      console.log('❌ Empty items array');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    if (!customerInfo) {
      console.log('❌ No customer info');
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }
    
    if (!customerInfo.name || !customerInfo.phone) {
      console.log('❌ Missing name or phone');
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
        customerInfo: customerInfo
      });
    }
    
    console.log('👤 Customer:', customerInfo.name);
    console.log('📞 Phone:', customerInfo.phone);
    
    // === CALCULATE TOTALS ===
    let subtotal = 0;
    items.forEach((item, index) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += price * quantity;
      console.log(`   Item ${index + 1}: ${item.name} - $${price} x ${quantity} = $${price * quantity}`);
    });
    
    const shipping = 5.00;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + shipping + tax;
    
    console.log('💰 Order Summary:');
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   Shipping: $${shipping.toFixed(2)}`);
    console.log(`   Tax (8%): $${tax.toFixed(2)}`);
    console.log(`   Total: $${totalAmount.toFixed(2)}`);
    
    // === GET USER FROM TOKEN ===
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Decode token (for demo - in production, verify with JWT)
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64').toString();
        const userData = JSON.parse(payload);
        userId = userData.userId;
        console.log(`👤 User ID from token: ${userId}`);
      } catch (tokenError) {
        console.log('⚠️ Token invalid, proceeding as guest order:', tokenError.message);
      }
    }
    
    // === PREPARE ORDER ITEMS (FIXED) ===
    const orderItems = items.map(item => {
      // Handle product field - only set if it's a valid ObjectId
      let productField = null;
      const productId = item.productId || '';
      
      if (productId && isValidObjectId(productId)) {
        productField = new mongoose.Types.ObjectId(productId);
      }
      
      return {
        product: productField, // Will be null for string IDs like "9", "12"
        productId: productId,  // Store the original string ID
        name: item.name || 'Product',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        shade: item.shade || 'default'
      };
    });
    
    // === CREATE ORDER OBJECT ===
    const orderData = {
      user: userId,
      customerInfo: {
        name: (customerInfo.name || '').trim(),
        email: (customerInfo.email || '').trim().toLowerCase(),
        phone: (customerInfo.phone || '').trim()
      },
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paymentMethod: paymentMethod || 'cash',
      deliveryAddress: {
        street: (deliveryAddress?.street || '').trim(),
        city: (deliveryAddress?.city || '').trim(),
        state: (deliveryAddress?.state || '').trim(),
        zipCode: (deliveryAddress?.zipCode || '').trim(),
        country: (deliveryAddress?.country || 'Ethiopia').trim()
      },
      notes: notes || '',
      status: 'pending'
    };
    
    console.log('📝 Final order data:', JSON.stringify(orderData, null, 2));
    
    // === SAVE TO DATABASE ===
    console.log('💾 Saving order to database...');
    
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      console.log('✅ ORDER SAVED SUCCESSFULLY!');
      console.log(`   Order ID: ${savedOrder._id}`);
      console.log(`   Order Number: ${savedOrder.orderNumber}`);
      console.log(`   Customer: ${savedOrder.customerInfo.name}`);
      console.log(`   Total: $${savedOrder.totalAmount}`);
      
      console.log('='.repeat(60));
      console.log('✅ CHECKOUT COMPLETE\n');
      
      // Send success response
      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        order: savedOrder
      });
      
    } catch (saveError) {
      console.error('❌ DATABASE SAVE ERROR:', saveError.message);
      console.error('Validation errors:', saveError.errors);
      throw saveError; // Let the outer catch handle it
    }
    
  } catch (error) {
    console.error('❌ ORDER CREATION ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('='.repeat(60) + '\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
      error: error.message,
      errorType: error.constructor.name
    });
  }
});

// DEBUG: Get all orders
router.get('/debug/all', async (req, res) => {
  try {
    console.log('📊 Fetching all orders from database...');
    
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`✅ Found ${orders.length} orders`);
    
    const simplifiedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customerInfo?.name || 'No name',
      email: order.customerInfo?.email || 'No email',
      phone: order.customerInfo?.phone || 'No phone',
      total: order.totalAmount,
      items: order.items.length,
      status: order.status,
      date: order.createdAt,
      user: order.user || 'guest'
    }));
    
    res.json({
      success: true,
      count: orders.length,
      orders: simplifiedOrders
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get orders for authenticated user
router.get('/my-orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64').toString();
        const userData = JSON.parse(payload);
        userId = userData.userId;
      } catch (error) {
        // Token invalid, return empty array
        return res.json({
          success: true,
          orders: []
        });
      }
    }
    
    if (!userId) {
      return res.json({
        success: true,
        orders: []
      });
    }
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Clear all orders (for testing)
router.delete('/debug/clear', async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} orders`);
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} orders`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Clear orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear orders',
      error: error.message
    });
  }
});

// Test endpoint
router.post('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  
  res.json({
    success: true,
    message: 'Order endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;