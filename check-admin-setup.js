// backend/check-admin-setup.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkSetup() {
  console.log('🔧 CHECKING ADMIN SETUP');
  console.log('=======================\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('1. 📦 Checking database connection...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`   Connected to: ${mongoose.connection.name}`);
    console.log(`   Collections: ${collections.length}`);
    
    // Check collections
    console.log('\n2. 📊 Checking collections...');
    const neededCollections = ['users', 'products', 'carts', 'orders'];
    for (const col of neededCollections) {
      const exists = collections.some(c => c.name === col);
      console.log(`   ${col}: ${exists ? '✅' : '❌'}`);
    }
    
    // Check admin user
    console.log('\n3. 👑 Checking admin user...');
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
      console.log(`   ✅ Admin found: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Name: ${admin.name}`);
    } else {
      console.log('   ❌ Admin not found!');
      console.log('   Run: node createAdmin.js');
    }
    
    // Check products
    console.log('\n4. 🛍️ Checking products...');
    const Product = require('./models/Product');
    const products = await Product.find();
    console.log(`   Products: ${products.length}`);
    if (products.length === 0) {
      console.log('   ⚠️ No products! Run: node scripts/addProducts.js');
    }
    
    // Check orders
    console.log('\n5. 📦 Checking orders...');
    const Order = require('./models/Order');
    const orders = await Order.find();
    console.log(`   Orders: ${orders.length}`);
    if (orders.length === 0) {
      console.log('   ℹ️ No orders yet - customers need to checkout');
      console.log('   You can create test orders from admin dashboard');
    }
    
    // Check carts
    console.log('\n6. 🛒 Checking carts...');
    const Cart = require('./models/Cart');
    const carts = await Cart.find();
    console.log(`   Carts: ${carts.length}`);
    
    console.log('\n✅ SETUP CHECK COMPLETE');
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start backend: npm start');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as admin: admin@gmail.com / Admin123');
    console.log('4. Go to: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkSetup();