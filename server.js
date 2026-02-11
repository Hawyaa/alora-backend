const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 1. CORS FIRST
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://alora-tau.vercel.app',
    'https://alora-rloyrtz59-hawi-s-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ✅ 2. JSON PARSER SECOND
app.use(express.json());

// ✅ 3. Request logging THIRD
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0 && req.path !== '/api/auth/login') {
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ✅ 4. IMPORT routes ONCE
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/order');
const homepageProductsRoutes = require('./routes/homepageProducts');

// ✅ 5. USE routes AFTER middleware
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/homepage-products', homepageProductsRoutes);

// ✅ 6. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Alora Lipgloss API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ✅ 7. Debug endpoint
app.get('/api/debug/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
        dbState: mongoose.connection.readyState
      });
    }
    
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

// ✅ 8. Handle undefined API routes (MUST be LAST)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.path}`
    });
  }
  next();
});

// ✅ 9. Global error handler (MUST be VERY LAST)
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

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alora';
    console.log(`🔗 Connecting to MongoDB at: ${mongoURI.replace(/\/\/[^@]*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📈 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

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
    console.log(`🏠 Homepage: http://localhost:${PORT}/api/homepage-products`);
    console.log(`🐛 Debug: http://localhost:${PORT}/api/debug/orders`);
    console.log('='.repeat(50));
    
    if (mongoose.connection.readyState !== 1) {
      console.log('\n⚠️  WARNING: Database is not connected!');
    } else {
      console.log('\n✅ Database is connected and ready!');
    }
  });
};

startServer();