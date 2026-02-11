const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora');

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  role: String
}));

async function checkUsers() {
  console.log('🔍 Checking users in database...');
  const users = await User.find({});
  console.log(`📊 Total users: ${users.length}`);
  
  users.forEach((user, index) => {
    console.log(`\nUser ${index + 1}:`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
  });
  
  mongoose.disconnect();
}

checkUsers();