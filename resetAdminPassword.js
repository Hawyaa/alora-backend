const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB - SIMPLIFIED connection for newer MongoDB driver
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora');
    
    console.log('✅ Connected to MongoDB');
    
    // Get User model
    let User;
    try {
      User = mongoose.model('User');
    } catch (error) {
      // If model doesn't exist, create simple schema
      const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        phone: String,
        address: Object,
        createdAt: Date,
        updatedAt: Date
      });
      User = mongoose.model('User', userSchema);
    }
    
    // Find the existing admin
    console.log('🔍 Looking for admin@gmail.com...');
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!existingAdmin) {
      console.log('❌ admin@gmail.com not found in database!');
      console.log('Creating it now...');
      
      // Create new admin if doesn't exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new User({
        name: 'Store Owner',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        address: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newAdmin.save();
      console.log('✅ Created new admin@gmail.com');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
      
    } else {
      // Reset password for existing admin
      console.log('✅ Found existing admin:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Current Role: ${existingAdmin.role}`);
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update password and ensure role is admin
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.updatedAt = new Date();
      
      await existingAdmin.save();
      
      console.log('\n✅ PASSWORD RESET SUCCESSFUL!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 NEW Password: admin123');
      console.log('👑 Role: admin (confirmed)');
      console.log('🕒 Updated at:', new Date().toISOString());
    }
    
    // Verify the reset worked
    console.log('\n🔍 Verifying login...');
    const verifyAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (verifyAdmin) {
      // Test password match
      const passwordMatch = await bcrypt.compare('admin123', verifyAdmin.password);
      console.log(`✅ User exists: ${verifyAdmin.email}`);
      console.log(`✅ Password match test: ${passwordMatch ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Role: ${verifyAdmin.role}`);
      
      if (passwordMatch) {
        console.log('🎉 READY TO LOGIN! Use:');
        console.log('   Email: admin@gmail.com');
        console.log('   Password: admin123');
      }
    }
    
    // List all admins
    console.log('\n📋 All Admin Users:');
    const allAdmins = await User.find({ role: 'admin' });
    allAdmins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
    
    // Close connection
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    
    // Try alternative connection method
    console.log('\n🔄 Trying alternative connection...');
    try {
      // Try direct MongoDB connection
      const { MongoClient } = require('mongodb');
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const client = new MongoClient(uri);
      
      await client.connect();
      console.log('✅ Connected via direct MongoDB client');
      
      const database = client.db('alora');
      const users = database.collection('users');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update admin user
      const result = await users.updateOne(
        { email: 'admin@gmail.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`✅ Updated admin: Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
      
      await client.close();
      
    } catch (altError) {
      console.error('❌ Alternative method also failed:', altError.message);
    }
    
    process.exit(1);
  }
}

// Run the function
resetAdminPassword();