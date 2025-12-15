// Save as: backend/checkAllUsers.js
const { MongoClient } = require('mongodb');

async function checkUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('alora-lipgloss');
    const users = await db.collection('users').find({}).toArray();
    
    console.log('================================');
    console.log('📋 ALL USERS IN YOUR DATABASE:');
    console.log('================================');
    
    if (users.length === 0) {
      console.log('❌ No users found! You need to register first.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'No name'}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log('---');
      });
    }
  } finally {
    await client.close();
  }
}

checkUsers();