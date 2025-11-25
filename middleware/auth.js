const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called for:', req.method, req.path);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header does not start with Bearer');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Empty token after Bearer prefix');
      return res.status(401).json({ message: 'No token found' });
    }

    console.log('🔑 Token extracted (first 20 chars):', token.substring(0, 20) + '...');
    
    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('🔑 JWT Secret exists, length:', process.env.JWT_SECRET.length);
    
    // Verify token
    console.log('🔑 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);

    // Find user
    console.log('🔍 Looking for user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    
    // IMPORTANT: Call next() to continue to the next middleware/route
    next();
    
  } catch (error) {
    console.log('❌ Auth middleware error:', error.name);
    console.log('❌ Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token format',
        details: error.message 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        details: error.message 
      });
    }
    
    res.status(401).json({ 
      message: 'Token verification failed',
      error: error.message 
    });
  }
};

module.exports = auth;