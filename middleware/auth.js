const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token - user is a guest
      req.user = null;
      return next(); // Allow to proceed, but req.user will be null
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.log('⚠️ Auth middleware - Invalid token:', error.message);
    req.user = null;
    next(); // Still allow to proceed for guest checkouts
  }
};

module.exports = auth;