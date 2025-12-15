// backend/scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const adminEmail = 'admin@alora.com';
  const adminExists = await User.findOne({ email: adminEmail });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin', // <-- The key is setting the role here
      phone: '+1234567890'
    });
    await adminUser.save();
    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('⚠️ Admin user already exists.');
  }
  process.exit();
}
createAdmin();