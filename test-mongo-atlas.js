// test-mongo-atlas.js
const mongoose = require('mongoose');

async function test() {
  const uri = 'mongodb+srv://alora:alora33512@cluster0.ee9bi75.mongodb.net/alora-lipgloss?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('🔗 Testing Atlas connection...');
  
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.log('\n🔧 Fix MongoDB Atlas:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Click "Network Access"');
    console.log('3. Add IP Address: 0.0.0.0/0 (allow all)');
    console.log('4. Click "Database Access"');
    console.log('5. Make sure user "alora" has read/write access');
    return false;
  }
}

test();