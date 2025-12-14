require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import the fixed User model
    const User = require('./models/User-fixed');
    
    // Delete test user if exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Cleared previous test user');
    
    // Create test user manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    
    await testUser.save();
    console.log('✅ Created test user: test@example.com / password123');
    
    // Verify password comparison works
    const user = await User.findOne({ email: 'test@example.com' });
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('✅ Password verification:', isValid ? 'PASS' : 'FAIL');
    
    console.log('\n🎯 Ready for testing!');
    console.log('👉 Email: test@example.com');
    console.log('👉 Password: password123');
    console.log('👉 Test at: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testAuth();