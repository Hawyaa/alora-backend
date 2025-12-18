const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss');
  
  const User = require('./models/User');
  const user = await User.findOne({ email: 'll@gmail.com' });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  // Set new password to something simple
  const newPassword = 'Ll123456';
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  await user.save();
  console.log(`✅ Password reset for ${user.email}`);
  console.log(`New password: ${newPassword}`);
  
  mongoose.disconnect();
}

resetPassword().catch(console.error);