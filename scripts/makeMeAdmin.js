// C:\Users\Hawi\Desktop\alora\backend\scripts\makeMeAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss');
    
    // ⚠️ CHANGE THIS EMAIL to YOUR actual email address ⚠️
    const myEmail = "YOUR_EMAIL_HERE@gmail.com"; 
    
    console.log(`🔍 Looking for user: ${myEmail}`);
    
    const user = await User.findOne({ email: myEmail });
    
    if (!user) {
      console.log('❌ User not found! Check your email address.');
      console.log('Available users in database:');
      const allUsers = await User.find({}, 'email name role');
      allUsers.forEach(u => console.log(`- ${u.email} (${u.name}) - Role: ${u.role}`));
    } else {
      console.log('✅ User found:', user.email);
      
      user.role = 'admin';
      await user.save();
      
      console.log('🎉 SUCCESS! You are now an ADMIN!');
      console.log('User Details:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- New Role:', user.role);
      console.log('\n🚀 Now you can login to: http://localhost:3000/admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

makeAdmin();