const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Simple test version - initialize payment
const initializePayment = async (req, res) => {
  try {
    console.log('💰 Payment initialization called by:', req.user.email);
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items to cart first.'
      });
    }

    console.log('🛒 Cart items:', cart.items.length);
    console.log('💰 Total amount:', cart.totalAmount);

    // For testing, just return success without actual Chapa call
    res.json({
      success: true,
      message: 'Payment initialization successful!',
      testMode: true,
      cartSummary: {
        items: cart.items.length,
        totalAmount: cart.totalAmount,
        currency: 'ETB'
      },
      note: 'Chapa integration ready - add CHAPA_SECRET_KEY to .env'
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
};

// Verify payment (webhook)
const verifyPayment = async (req, res) => {
  try {
    console.log('🔍 Payment verification webhook called:', req.body);
    res.json({ 
      success: true, 
      message: 'Webhook received',
      data: req.body 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Manual verification
const manualVerify = async (req, res) => {
  try {
    const { transactionId } = req.params;
    console.log('🔍 Manual verification for:', transactionId);
    
    res.json({
      success: true,
      message: 'Manual verification endpoint',
      transactionId: transactionId
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