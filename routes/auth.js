const express = require('express');
const router = express.Router();

// Debug: Check what we're importing
console.log('🔍 Loading auth controller...');
try {
  const authController = require('../controllers/authController');
  console.log('✅ Auth controller loaded:', Object.keys(authController));
  
  // Debug each function
  console.log('🔍 Register:', typeof authController.register);
  console.log('🔍 Login:', typeof authController.login);
  console.log('🔍 GetProfile:', typeof authController.getProfile);
  
  // Use the functions
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/profile', (req, res) => {
    res.json({ message: 'Profile route - working!' });
  });
  
} catch (error) {
  console.log('❌ Error loading auth controller:', error.message);
  console.log('Stack:', error.stack);
  
  // Fallback routes for testing
  router.post('/register', (req, res) => {
    res.status(500).json({ error: 'Auth controller not loaded properly' });
  });
  
  router.post('/login', (req, res) => {
    res.status(500).json({ error: 'Auth controller not loaded properly' });
  });
}

module.exports = router;