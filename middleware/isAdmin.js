// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  try {
    console.log('🔍 Checking admin role:', req.user?.role);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required. Your role: ' + req.user.role 
      });
    }
    
    console.log('✅ Admin access granted for:', req.user.email);
    next();
    
  } catch (error) {
    console.error('❌ isAdmin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

module.exports = isAdmin;