const express = require('express');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
router.post('/test-order', (req, res) => {
  console.log('Test order request:', req.body);
  
  res.json({
    success: true,
    message: 'Test order received',
    data: req.body
  });
});

module.exports = router;