// File: updateAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // PUT YOUR EMAIL HERE
  const result = await User.updateOne(
    { email: "YOUR_REAL_EMAIL@gmail.com" },
    { $set: { role: "admin" } }
  );
  
  console.log('Result:', result);
  console.log('Modified:', result.modifiedCount, 'user(s)');
  
  // Verify
  const user = await User.findOne({ email: "YOUR_REAL_EMAIL@gmail.com" });
  console.log('✅ Now:', user.email, 'is', user.role);
  
  process.exit();
}

updateAdmin();