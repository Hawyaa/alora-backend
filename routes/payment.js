const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// In-memory storage for orders
const userCarts = new Map(); // Store user carts to clear after payment
const orders = new Map();

// POST /api/payment/initialize
router.post('/initialize', auth, async (req, res) => {
  try {
    const { amount, email, firstName, lastName, phone } = req.body;
    const userId = req.user.userId;

    console.log('Payment request from user:', userId, 'Amount:', amount);

    // Validate required fields
    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        error: 'Amount and email are required'
      });
    }

    // Check Chapa key
    if (!process.env.CHAPA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Payment service not configured'
      });
    }

    // Create transaction reference
    const tx_ref = `alora-${Date.now()}`;
    
    // Payment data for Chapa
    const paymentData = {
      amount: amount.toString(),
      currency: 'ETB',
      email: email,
      first_name: firstName || 'Customer',
      last_name: lastName || '',
      phone_number: phone || '',
      tx_ref: tx_ref,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?tx_ref=${tx_ref}`,
      customization: {
        title: 'Alora Lipgloss',
        description: 'Lipgloss Products'
      }
    };

    console.log('Initializing Chapa payment...');

    // Call Chapa API
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('Chapa response received');

    if (chapaResponse.data.status === 'success' && chapaResponse.data.data?.checkout_url) {
      // Store order as pending
      const order = {
        orderId: tx_ref,
        userId: userId,
        amount: amount,
        currency: 'ETB',
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: userCarts.get(userId) || [] // Store cart items
      };
      
      orders.set(tx_ref, order);

      res.json({
        success: true,
        message: 'Payment initialized',
        checkout_url: chapaResponse.data.data.checkout_url,
        tx_ref: tx_ref
      });
    } else {
      throw new Error(chapaResponse.data.message || 'Chapa payment failed');
    }

  } catch (error) {
    console.error('Payment error:', error.message);
    
    let errorMessage = 'Payment initialization failed';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Payment provider error';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Payment timeout';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// POST /api/payment/verify - For Chapa webhook (optional but recommended)
router.post('/verify', async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    
    console.log('Chapa webhook received:', { tx_ref, status });

    if (tx_ref && status === 'success') {
      const order = orders.get(tx_ref);
      if (order) {
        order.status = 'completed';
        order.paidAt = new Date().toISOString();
        
        // Clear user's cart
        if (userCarts.has(order.userId)) {
          userCarts.delete(order.userId);
        }
        
        console.log('Payment verified and completed for order:', tx_ref);
      }
    }

    res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

// GET /api/payment/status/:tx_ref
router.get('/status/:tx_ref', auth, async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const userId = req.user.userId;

    console.log('Checking payment status for:', tx_ref);

    const order = orders.get(tx_ref);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify the order belongs to the user
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // For testing: Auto-complete payments after 5 seconds
    if (order.status === 'pending' && Date.now() - new Date(order.createdAt).getTime() > 5000) {
      order.status = 'completed';
      order.paidAt = new Date().toISOString();
      
      // Clear user's cart
      if (userCarts.has(userId)) {
        userCarts.delete(userId);
      }
      
      console.log('Auto-completing payment for testing:', tx_ref);
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check status'
    });
  }
});

// POST /api/payment/complete - Manually complete payment for testing
router.post('/complete', auth, async (req, res) => {
  try {
    const { tx_ref } = req.body;
    const userId = req.user.userId;

    console.log('Manually completing payment:', tx_ref);

    const order = orders.get(tx_ref);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    order.status = 'completed';
    order.paidAt = new Date().toISOString();

    // Clear user's cart
    if (userCarts.has(userId)) {
      userCarts.delete(userId);
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
      order: order
    });

  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete payment'
    });
  }
});

// Store user cart before payment
router.post('/store-cart', auth, async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user.userId;

    userCarts.set(userId, cartItems);
    
    res.json({ success: true, message: 'Cart stored' });
  } catch (error) {
    console.error('Store cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to store cart' });
  }
});

module.exports = router;