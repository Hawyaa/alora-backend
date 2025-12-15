// fixIndex.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect using your .env connection string
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss');
    
    console.log('✅ Connected to MongoDB');
    
    // Get the native MongoDB driver
    const db = mongoose.connection.db;
    
    // 1. Check current indexes
    console.log('\n📋 Checking current indexes...');
    const indexes = await db.collection('orders').indexes();
    
    console.log('Current indexes on "orders" collection:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key);
    });
    
    // 2. Drop the orderId_1 index if it exists
    const orderIdIndex = indexes.find(idx => idx.name === 'orderId_1');
    if (orderIdIndex) {
      console.log('\n🗑️  Found problematic index: orderId_1');
      console.log('Dropping orderId_1 index...');
      
      try {
        await db.collection('orders').dropIndex('orderId_1');
        console.log('✅ Successfully dropped orderId_1 index');
      } catch (dropError) {
        console.log('⚠️ Could not drop index:', dropError.message);
      }
    } else {
      console.log('\n✅ No orderId_1 index found (already removed)');
    }
    
    // 3. Remove orderId field from existing documents
    console.log('\n🧹 Cleaning up orderId fields from existing documents...');
    const result = await db.collection('orders').updateMany(
      { orderId: { $exists: true } },
      { $unset: { orderId: "" } }
    );
    console.log(`✅ Removed orderId field from ${result.modifiedCount} documents`);
    
    // 4. Verify indexes again
    console.log('\n📋 Final index check:');
    const finalIndexes = await db.collection('orders').indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key);
    });
    
    console.log('\n🎉 Index fix completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test checkout again');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the function
fixDuplicateIndex();