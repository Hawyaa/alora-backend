// Create file: checkUsers.js in backend folder
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  
  console.log('📋 ALL USERS IN DATABASE:');
  users.forEach(user => {
    console.log(`- Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role || 'user'}`);
    console.log(`  ID: ${user._id}`);
    console.log('---');
  });
  
  process.exit();
}

checkUsers();