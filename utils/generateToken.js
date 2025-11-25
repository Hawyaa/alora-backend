const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  try {
    console.log('🔑 Generating token for user:', userId);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    if (!userId) {
      throw new Error('User ID is required for token generation');
    }
    
    console.log('🔑 JWT Secret length:', process.env.JWT_SECRET.length);
    
    const token = jwt.sign(
      { userId: userId.toString() }, // Ensure it's a string
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    console.log('✅ Token generated successfully');
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    
    return token;
  } catch (error) {
    console.error('❌ Token generation error:', error.message);
    throw error;
  }
};

module.exports = generateToken;