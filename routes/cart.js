const express = require('express');
const router = express.Router();

// Simple test route - NO AUTH for now
router.get('/', (req, res) => {
  console.log('🛒 Cart GET route called');
  res.json({
    success: true,
    message: 'Cart is working!',
    items: [],
    totalAmount: 0
  });
});

// Simple add to cart - NO AUTH for now
router.post('/add', (req, res) => {
  console.log('🛒 Add to cart called with:', req.body);
  res.json({
    success: true,
    message: 'Add to cart is working!',
    receivedData: req.body
  });
});

module.exports = router;