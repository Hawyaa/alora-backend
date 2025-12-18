const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss')
  .then(async () => {
    const User = require('./models/User');
    const user = await User.findOne({ email: 'll@gmail.com' });

    if (!user) {
      console.log('❌ User ll@gmail.com not found in database');
    } else {
      console.log('✅ User found:', {
        email: user.email,
        name: user.name,
        passwordHash: user.password ? 'HASHED' : 'MISSING',
        passwordLength: user.password ? user.password.length : 0,
        role: user.role
      });

      // Test common passwords
      const testPasswords = ['123456', 'password', 'Password123', 'll123456', 'll@gmail.com', '12345678'];
      
      for (const testPassword of testPasswords) {
        if (user.password) {
          const isValid = await bcrypt.compare(testPassword, user.password);
          if (isValid) {
            console.log(`🎉 FOUND PASSWORD: '${testPassword}'`);
          }
        }
      }
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });