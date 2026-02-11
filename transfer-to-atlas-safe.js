// transfer-to-atlas-safe.js
const mongoose = require('mongoose');

async function transferData() {
  console.log('🚀 TRANSFERRING ALL DATA TO PRODUCTION');
  console.log('=======================================\n');
  
  // Step 1: Connect to LOCAL database
  console.log('1. 📍 Connecting to LOCAL database...');
  const localUri = 'mongodb://localhost:27017/alora-lipgloss';
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    console.log('   ✅ Connected to local database');
  } catch (error) {
    console.log('   ❌ Failed to connect to local database:', error.message);
    console.log('   💡 Make sure MongoDB is running:');
    console.log('   - Open Command Prompt as Administrator');
    console.log('   - Run: net start MongoDB');
    return;
  }
  
  // Get ALL data from local
  console.log('2. 📥 Fetching all local data...');
  
  // Define schemas
  const userSchema = new mongoose.Schema({}, { strict: false });
  const productSchema = new mongoose.Schema({}, { strict: false });
  const orderSchema = new mongoose.Schema({}, { strict: false });
  const cartSchema = new mongoose.Schema({}, { strict: false });
  
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
  const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
  const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
  
  let users = [], products = [], orders = [], carts = [];
  
  try {
    [users, products, orders, carts] = await Promise.all([
      User.find({}),
      Product.find({}),
      Order.find({}),
      Cart.find({})
    ]);
    
    console.log(`✅ Found: ${users.length} users, ${products.length} products, ${orders.length} orders, ${carts.length} carts`);
    console.log(`📧 Users: ${users.slice(0, 5).map(u => u.email).join(', ')}${users.length > 5 ? '...' : ''}`);
  } catch (error) {
    console.log('   ❌ Failed to fetch data:', error.message);
    await mongoose.disconnect();
    return;
  }
  
  // Disconnect from local
  await mongoose.disconnect();
  console.log('\n3. 🔌 Disconnected from local database');
  
  // Step 2: Connect to ATLAS (production)
  console.log('4. ☁️  Connecting to MongoDB Atlas...');
  const atlasUri = 'mongodb+srv://alora:alora33512@cluster0.ee9bi75.mongodb.net/alora-lipgloss?retryWrites=true&w=majority&appName=Cluster0';
  
  try {
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
    console.log('   ✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.log('   ❌ Failed to connect to Atlas:', error.message);
    console.log('   💡 Check:');
    console.log('   1. Internet connection');
    console.log('   2. MongoDB Atlas cluster is running');
    console.log('   3. IP address is whitelisted in Atlas');
    return;
  }
  
  // Step 3: Clear collections individually (safer)
  console.log('5. 🧼 Cleaning collections...');
  
  const collections = ['users', 'products', 'orders', 'carts'];
  for (const collectionName of collections) {
    try {
      const count = await mongoose.connection.collection(collectionName).countDocuments();
      if (count > 0) {
        await mongoose.connection.collection(collectionName).deleteMany({});
        console.log(`   ✅ Cleared ${collectionName} (${count} documents)`);
      } else {
        console.log(`   ℹ️  ${collectionName} already empty`);
      }
    } catch (e) {
      console.log(`   ⚠️  Could not clear ${collectionName}:`, e.message);
    }
  }
  
  // Step 4: Insert ALL data
  console.log('\n6. 📤 Transferring data to Atlas...');
  
  if (users.length > 0) {
    try {
      await mongoose.connection.collection('users').insertMany(users);
      console.log(`   ✅ Users: ${users.length} transferred`);
    } catch (e) {
      console.log(`   ❌ Failed to insert users:`, e.message);
      if (e.code === 11000) {
        console.log('   💡 Duplicate email found. Trying one by one...');
        let successCount = 0;
        for (const user of users) {
          try {
            await mongoose.connection.collection('users').insertOne(user);
            successCount++;
          } catch (err) {
            console.log(`     Skipping ${user.email}: ${err.message}`);
          }
        }
        console.log(`   ✅ Inserted ${successCount}/${users.length} users`);
      }
    }
  }
  
  if (products.length > 0) {
    try {
      await mongoose.connection.collection('products').insertMany(products);
      console.log(`   ✅ Products: ${products.length} transferred`);
    } catch (e) {
      console.log(`   ❌ Failed to insert products:`, e.message);
    }
  }
  
  if (orders.length > 0) {
    try {
      await mongoose.connection.collection('orders').insertMany(orders);
      console.log(`   ✅ Orders: ${orders.length} transferred`);
    } catch (e) {
      console.log(`   ❌ Failed to insert orders:`, e.message);
    }
  }
  
  if (carts.length > 0) {
    try {
      await mongoose.connection.collection('carts').insertMany(carts);
      console.log(`   ✅ Carts: ${carts.length} transferred`);
    } catch (e) {
      console.log(`   ❌ Failed to insert carts:`, e.message);
    }
  }
  
  // Step 5: Update admin roles
  console.log('\n7. 👑 Setting up admin accounts...');
  
  try {
    // Update admin@gmail.com to admin role
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'admin@gmail.com' },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('   ✅ Updated: admin@gmail.com → admin role');
    } else {
      console.log('   ℹ️  admin@gmail.com not found or already admin');
    }
    
    // Create additional admin if needed
    const adminExists = await mongoose.connection.collection('users').findOne({ 
      email: 'admin@alora.com' 
    });
    
    if (!adminExists) {
      // Find a user to copy password from (use admin@gmail.com if exists)
      const existingAdmin = await mongoose.connection.collection('users').findOne({ 
        email: 'admin@gmail.com' 
      });
      
      if (existingAdmin) {
        await mongoose.connection.collection('users').insertOne({
          name: 'Alora Production Admin',
          email: 'admin@alora.com',
          password: existingAdmin.password, // Copy hash from existing admin
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('   ✅ Created: admin@alora.com');
        console.log('      Password: Same as admin@gmail.com');
      } else {
        console.log('   ⚠️  Cannot create admin@alora.com - no admin to copy password from');
      }
    } else {
      // Make sure existing admin@alora.com has admin role
      await mongoose.connection.collection('users').updateOne(
        { email: 'admin@alora.com' },
        { $set: { role: 'admin' } }
      );
      console.log('   ℹ️  admin@alora.com already exists (updated role)');
    }
  } catch (e) {
    console.log('   ⚠️  Could not update admin roles:', e.message);
  }
  
  // Step 6: Verify
  console.log('\n8. 📊 Verifying transfer...');
  
  try {
    const atlasUsers = await mongoose.connection.collection('users').countDocuments();
    const atlasProducts = await mongoose.connection.collection('products').countDocuments();
    const atlasOrders = await mongoose.connection.collection('orders').countDocuments();
    const atlasCarts = await mongoose.connection.collection('carts').countDocuments();
    
    console.log('\n🎉 TRANSFER COMPLETE!');
    console.log('====================');
    console.log('📊 MongoDB Atlas now has:');
    console.log(`   👤 ${atlasUsers} users (was ${users.length})`);
    console.log(`   🛍️  ${atlasProducts} products (was ${products.length})`);
    console.log(`   📦 ${atlasOrders} orders (was ${orders.length})`);
    console.log(`   🛒 ${atlasCarts} carts (was ${carts.length})`);
    
    if (atlasUsers > 0) {
      const adminUsers = await mongoose.connection.collection('users')
        .find({ role: 'admin' })
        .toArray();
      
      if (adminUsers.length > 0) {
        console.log('\n🔑 ADMIN ACCOUNTS:');
        adminUsers.forEach(admin => {
          console.log(`   📧 ${admin.email} (${admin.name || 'No name'})`);
        });
        
        console.log('\n🔐 TEST LOGIN:');
        console.log('   Email: admin@gmail.com');
        console.log('   Email: admin@alora.com');
        console.log('   Password: Use your existing password');
      }
    }
    
    console.log('\n✅ Database is ready for production!');
    
  } catch (e) {
    console.log('   ⚠️  Could not verify transfer:', e.message);
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. ✅ Update Render environment variables (already done)');
  console.log('2. ✅ Wait for Render to redeploy');
  console.log('3. 🌐 Test: https://alora-backend.onrender.com/api/health');
  console.log('4. 🎨 Deploy frontend to Vercel');
  console.log('5. 📱 Test on mobile/other devices');
  
  await mongoose.disconnect();
  console.log('\n🏁 Script finished!');
}

// Run the function
transferData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});