// create-new-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
  const atlasUri = 'mongodb+srv://alora:alora33512@cluster0.ee9bi75.mongodb.net/alora-lipgloss?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(atlasUri);
  
  // User schema
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    createdAt: Date
  }));
  
  // CREATE YOUR NEW ADMIN - CHOOSE ONE:
  
  // Option A: Simple admin
  const newAdmin = {
    name: 'Alora Administrator',
    email: 'admin@alora.com',  // ← Change this to what you want
    password: 'Alora123!',      // ← Change this to what you want
    role: 'admin'
  };
  
  // Option B: Super admin
  const superAdmin = {
    name: 'Super Admin',
    email: 'super@alora.com',   // ← Or use this
    password: 'SuperAdmin2024!', // ← Or use this
    role: 'admin'
  };
  
  // Choose which one to create (or create both!)
  const adminsToCreate = [newAdmin]; // Add superAdmin here too if needed
  
  console.log('\n👑 CREATING NEW ADMIN ACCOUNTS:');
  
  for (const adminData of adminsToCreate) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create or update the user
    const result = await User.findOneAndUpdate(
      { email: adminData.email },
      {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`\n✅ ADMIN CREATED:`);
    console.log(`   📧 Email: ${adminData.email}`);
    console.log(`   🔑 Password: ${adminData.password}`);
    console.log(`   👑 Role: ${adminData.role}`);
    console.log(`   🆔 ID: ${result._id}`);
  }
  
  // List all admins
  const allAdmins = await User.find({ role: 'admin' });
  console.log('\n📋 ALL ADMIN ACCOUNTS:');
  allAdmins.forEach(admin => {
    console.log(`   - ${admin.email} (${admin.name})`);
  });
  
  await mongoose.disconnect();
  console.log('\n🎉 New admin account is ready!');
  console.log('\n🔗 Test login at: http://localhost:3000/login');
}

createNewAdmin().catch(console.error);