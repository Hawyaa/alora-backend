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
  if (req.body && Object.keys(req.body).length > 0 && req.path !== '/api/auth/login') {
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Import routes
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/order');
const homepageProductsRoutes = require('./routes/homepageProducts'); // ADD THIS LINE

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/homepage-products', homepageProductsRoutes); // ADD THIS LINE

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Alora Lipgloss API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint to see all orders
app.get('/api/debug/orders', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
        dbState: mongoose.connection.readyState // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      });
    }
    
    // Try to access Order model
    const Order = require('./models/Order');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customerInfo?.name || 'No name',
        total: order.totalAmount,
        items: order.items.length,
        status: order.status,
        date: order.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Debug orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed',
      error: error.message
    });
  }
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

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error.message);
  console.error('Stack trace:', error.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection - SIMPLIFIED VERSION
const connectDB = async () => {
  try {
    // Remove deprecated options for newer MongoDB driver
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alora';
    console.log(`🔗 Connecting to MongoDB at: ${mongoURI.replace(/\/\/[^@]*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📈 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Try alternative connection method
    console.log('🔄 Trying alternative connection method...');
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora', {
        useNewUrlParser: false, // Remove this option
        useUnifiedTopology: false // Remove this option
      });
      console.log('✅ MongoDB connected with alternative method!');
    } catch (altError) {
      console.error('❌ Alternative connection also failed:', altError.message);
      console.log('\n💡 TROUBLESHOOTING TIPS:');
      console.log('1. Make sure MongoDB is running: mongod --version');
      console.log('2. Start MongoDB service: sudo systemctl start mongod (Linux)');
      console.log('3. On Windows, check if MongoDB service is running in Services');
      console.log('4. Try: mongod --dbpath="C:/data/db" (Windows)');
      console.log('5. Install MongoDB Compass to check if database is accessible');
      
      // Don't exit, allow server to run (for development)
      console.log('\n⚠️  Server will run without database connection (for testing)');
    }
  }
};

// Start server even if DB fails (for development)
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Alora Lipgloss Server running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`🛒 Cart: http://localhost:${PORT}/api/cart`);
    console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
    console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);
    console.log(`📦 Orders: http://localhost:${PORT}/api/orders`);
    console.log(`👑 Admin: http://localhost:${PORT}/api/admin`);
    console.log(`🏠 Homepage: http://localhost:${PORT}/api/homepage-products`); // ADD THIS LINE
    console.log(`🐛 Debug: http://localhost:${PORT}/api/debug/orders`);
    console.log('='.repeat(50));
    
    if (mongoose.connection.readyState !== 1) {
      console.log('\n⚠️  WARNING: Database is not connected!');
      console.log('   Some features may not work properly.');
      console.log('   Orders will be saved to localStorage only.');
    } else {
      console.log('\n✅ Database is connected and ready!');
    }
  });
};

startServer();