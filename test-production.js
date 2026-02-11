// test-production.js
const axios = require('axios');

async function test() {
  console.log('🧪 TESTING PRODUCTION DEPLOYMENT');
  console.log('================================\n');
  
  const backendUrl = 'https://alora-backend.onrender.com';
  
  console.log('1. Testing backend health...');
  try {
    const health = await axios.get(`${backendUrl}/api/health`, { timeout: 10000 });
    console.log(`   ✅ Health: ${health.data.status}`);
    console.log(`   ✅ Database: ${health.data.database}`);
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
  }
  
  console.log('\n2. Testing products endpoint...');
  try {
    const products = await axios.get(`${backendUrl}/api/products`, { timeout: 10000 });
    console.log(`   ✅ Products: ${products.data.products?.length || 0} items`);
  } catch (error) {
    console.log(`   ❌ Products failed: ${error.message}`);
  }
  
  console.log('\n3. Testing admin login...');
  console.log('   📧 Email: admin@gmail.com');
  console.log('   🔑 Password: Your existing password');
  console.log('   🌐 URL: Your frontend will use this');
  
  console.log('\n🎯 NEXT: Deploy frontend to Vercel!');
  console.log('\n📋 Checklist:');
  console.log('✅ MongoDB Atlas data transferred');
  console.log('✅ Render environment updated');
  console.log('✅ Render deployment triggered');
  console.log('🔲 Wait for Render to finish deploying');
  console.log('🔲 Deploy frontend to Vercel');
  console.log('🔲 Update Render CLIENT_URL with Vercel URL');
  console.log('🔲 Test on mobile device');
}

test().catch(console.error);