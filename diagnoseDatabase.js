const mongoose = require('mongoose');
require('dotenv').config();

async function diagnoseDatabase() {
  console.log('🔍 DATABASE DIAGNOSIS');
  console.log('=====================\n');
  
  // 1. Check environment variables
  console.log('1. CHECKING ENVIRONMENT:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '*** SET ***' : 'NOT SET'}`);
  
  if (process.env.MONGODB_URI) {
    // Show partial URI for security
    const uri = process.env.MONGODB_URI;
    if (uri.includes('@')) {
      const safeUri = uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@');
      console.log(`   URI: ${safeUri}`);
    } else {
      console.log(`   URI: ${uri.substring(0, 50)}...`);
    }
  }
  
  // 2. Try local connection
  console.log('\n2. TESTING LOCAL DATABASE (alora-lipgloss):');
  try {
    await mongoose.connect('mongodb://localhost:27017/alora-lipgloss');
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    const localCount = await User.countDocuments();
    console.log(`   ✅ Connected, Users: ${localCount}`);
    await mongoose.disconnect();
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }
  
  // 3. Try another common local database name
  console.log('\n3. TESTING LOCAL DATABASE (alora):');
  try {
    await mongoose.connect('mongodb://localhost:27017/alora');
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));
    const localCount = await User.countDocuments();
    console.log(`   ✅ Connected, Users: ${localCount}`);
    await mongoose.disconnect();
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }
  
  // 4. If MONGODB_URI is set, test it
  if (process.env.MONGODB_URI) {
    console.log('\n4. TESTING PRODUCTION DATABASE (from .env):');
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const User = mongoose.model('User', new mongoose.Schema({ email: String }));
      const prodCount = await User.countDocuments();
      console.log(`   ✅ Connected, Users: ${prodCount}`);
      
      // List some users
      const users = await User.find().limit(5);
      console.log(`   Sample users (first 5):`);
      users.forEach((user, i) => {
        console.log(`     ${i + 1}. ${user.email || 'No email'} (${user.name || 'No name'})`);
      });
      
      await mongoose.disconnect();
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  // 5. Check what databases exist locally
  console.log('\n5. LISTING ALL LOCAL DATABASES:');
  try {
    const conn = await mongoose.createConnection('mongodb://localhost:27017');
    const adminDb = conn.db.admin();
    const result = await adminDb.listDatabases();
    
    console.log('   Available databases:');
    result.databases.forEach(db => {
      console.log(`   - ${db.name} (Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await conn.close();
  } catch (error) {
    console.log(`   ❌ Failed to list databases: ${error.message}`);
  }
  
  console.log('\n🔧 RECOMMENDATION:');
  console.log('Your app is likely using a different database than the one you checked.');
  console.log('Check your server logs when it starts to see which MongoDB URI it uses.');
}

diagnoseDatabase();