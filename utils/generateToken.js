const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  console.log('🔑 Generating token for user:', userId);
  console.log('🔑 Using JWT secret length:', process.env.JWT_SECRET?.length);
  
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log('🔑 Token generated:', token.substring(0, 20) + '...');
  
  return token;
};

module.exports = generateToken;