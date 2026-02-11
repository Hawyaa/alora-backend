const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db('alora');
    const users = database.collection('users');
    
    // Check if superadmin already exists
    const existingAdmin = await users.findOne({ email: 'superadmin@alora.com' });
    
    if (existingAdmin) {
      console.log('⚠️ superadmin@alora.com already exists. Updating to admin role...');
      
      // Update to admin role and reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await users.updateOne(
        { email: 'superadmin@alora.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            name: 'Super Admin',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Updated existing user to admin');
      
    } else {
      console.log('🆕 Creating new super admin...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      const superAdmin = {
        name: 'Super Admin',
        email: 'superadmin@alora.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1234567890',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await users.insertOne(superAdmin);
      console.log('✅ Super admin created successfully!');
    }
    
    // Verify
    const verifyAdmin = await users.findOne({ email: 'superadmin@alora.com' });
    console.log('\n🔍 VERIFICATION:');
    console.log(`Email: ${verifyAdmin.email}`);
    console.log(`Name: ${verifyAdmin.name}`);
    console.log(`Role: ${verifyAdmin.role}`);
    
    // Test password
    const passwordMatch = await bcrypt.compare('Admin123!', verifyAdmin.password);
    console.log(`Password test: ${passwordMatch ? '✅ PASS' : '❌ FAIL'}`);
    
    if (passwordMatch) {
      console.log('\n🎉 READY TO LOGIN AS ADMIN!');
      console.log('============================');
      console.log('📧 Email: superadmin@alora.com');
      console.log('🔑 Password: Admin123!');
      console.log('👑 Role: admin');
      console.log('============================');
    }
    
    // List ALL admin users
    console.log('\n📋 ALL ADMIN USERS IN DATABASE:');
    const allAdmins = await users.find({ role: 'admin' }).toArray();
    
    if (allAdmins.length === 0) {
      console.log('No admin users found!');
    } else {
      allAdmins.forEach((admin, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Role: ${admin.role}`);
        console.log(`  Created: ${admin.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

createSuperAdmin();