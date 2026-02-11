const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token - user is not authenticated
      req.user = null;
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Add userId (ensure consistent naming)
    req.user = {
      userId: decoded.userId || decoded._id || decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    console.log('⚠️ Auth middleware - Invalid token:', error.message);
    req.user = null;
    next(); // Allow to proceed for guest checkouts
  }
};

module.exports = auth;