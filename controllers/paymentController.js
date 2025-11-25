const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Initialize Chapa payment
const initializePayment = async (req, res) => {
  try {
    const { return_url } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: cart.items,
      totalAmount: cart.totalAmount,
      status: 'pending'
    });
    await order.save();

    // Prepare Chapa payment data
    const paymentData = {
      amount: cart.totalAmount.toString(),
      currency: 'ETB',
      email: req.user.email,
      first_name: req.user.name.split(' ')[0],
      last_name: req.user.name.split(' ')[1] || '',
      tx_ref: `order-${order._id}-${Date.now()}`,
      callback_url: `${process.env.BASE_URL}/api/payments/verify`,
      return_url: return_url || `${process.env.BASE_URL}/order-success`,
      customization: {
        title: 'Alora Lip Gloss',
        description: 'Lipstick and Beauty Products'
      }
    };

    // Initialize Chapa payment
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update order with transaction reference
    order.transactionRef = paymentData.tx_ref;
    order.paymentUrl = chapaResponse.data.data.checkout_url;
    await order.save();

    res.json({
      success: true,
      message: 'Payment initialized',
      paymentUrl: chapaResponse.data.data.checkout_url,
      orderId: order._id,
      transactionRef: paymentData.tx_ref
    });

  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.response?.data || error.message
    });
  }
};

// Verify payment (Chapa webhook)
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.body;
    
    // Verify with Chapa
    const verifyResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );

    const paymentData = verifyResponse.data.data;

    // Find and update order
    const order = await Order.findOne({ transactionRef: tx_ref });
    if (order) {
      if (paymentData.status === 'success') {
        order.status = 'paid';
        order.paymentMethod = 'chapa';
        order.paidAt = new Date();
        
        // Clear user's cart
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [], totalAmount: 0 } }
        );
      } else {
        order.status = 'failed';
      }
      await order.save();
    }

    res.json({ success: true, status: paymentData.status });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Manual verification (for testing)
const manualVerify = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const order = await Order.findById(transactionId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify with Chapa
    const verifyResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${order.transactionRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );

    const paymentData = verifyResponse.data.data;

    if (paymentData.status === 'success') {
      order.status = 'paid';
      order.paymentMethod = 'chapa';
      order.paidAt = new Date();
      
      // Clear cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [], totalAmount: 0 } }
      );
      
      await order.save();
    }

    res.json({
      success: true,
      order: order,
      paymentStatus: paymentData.status
    });

  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  manualVerify
};