const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Alora Lipgloss API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Handle undefined API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.path}`
    });
  }
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Alora Lipgloss Server running on port ${PORT}`);
      console.log(`📍 Base URL: http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🛒 Cart: http://localhost:${PORT}/api/cart`);
      console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
      console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);
      console.log('='.repeat(50));
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });