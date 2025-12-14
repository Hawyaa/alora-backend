require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // OPTION 1: Delete all users (bypass hooks)
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users from database`);
    
    // OPTION 2: Create a test user WITHOUT using save() (bypass hooks)
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10), // Hash manually
      role: 'user'
    });
    
    console.log('✅ Created test user:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    process.exit(1);
  }
}

// Need bcrypt for manual hashing
const bcrypt = require('bcryptjs');
cleanup();