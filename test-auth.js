const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasUsers = collections.some(col => col.name === 'users');
    
    if (!hasUsers) {
      console.log('❌ Users collection does not exist');
      
      // Create users collection and add a test user
      const User = mongoose.model('User', new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        createdAt: Date,
        updatedAt: Date
      }));
      
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@alora.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created test user: admin@alora.com / password123');
    } else {
      console.log('✅ Users collection exists');
      
      // Check existing users
      const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        createdAt: Date,
        updatedAt: Date
      }));
      
      const users = await User.find();
      console.log(`📊 Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name})`);
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });