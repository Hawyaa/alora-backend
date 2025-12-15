// backend/verifyAdmin.js
const { MongoClient } = require('mongodb');

async function verify() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('alora-lipgloss');
    
    console.log('🔍 CHECKING ADMIN STATUS:');
    console.log('========================');
    
    // Check admin@gmail.com
    const admin = await db.collection('users').findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('❌ admin@gmail.com NOT FOUND!');
    } else {
      console.log('✅ admin@gmail.com FOUND!');
      console.log('Role:', admin.role);
      console.log('Name:', admin.name);
      console.log('Has password:', admin.password ? 'Yes' : 'No');
    }
    
    // List all admins
    console.log('\n📋 ALL ADMIN USERS:');
    const admins = await db.collection('users').find({ role: 'admin' }).toArray();
    
    if (admins.length === 0) {
      console.log('⚠️ No admin users found!');
    } else {
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.name})`);
      });
    }
    
  } finally {
    await client.close();
  }
}

verify();