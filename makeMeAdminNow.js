// File: makeMeAdminNow.js
const { MongoClient } = require('mongodb');

async function makeAdmin() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('alora-lipgloss');
    const users = db.collection('users');
    
    // Find all users first
    const allUsers = await users.find({}).toArray();
    console.log('Current users:');
    allUsers.forEach(u => console.log(`- ${u.email} (${u.name})`));
    
    // Ask which email to make admin
    const emailToUpdate = 'test@example.com'; // CHANGE THIS
    
    const result = await users.updateOne(
      { email: emailToUpdate },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ ${emailToUpdate} is now ADMIN!`);
    } else {
      console.log('❌ User not found or already admin');
    }
    
  } finally {
    await client.close();
  }
}

makeAdmin();