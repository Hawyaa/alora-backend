const mongoose = require('mongoose');
require('dotenv').config();

async function listAllUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect using your production connection string
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file!');
      return;
    }
    
    console.log('Using MongoDB URI:', mongoUri.replace(/mongodb:\/\/[^:]+:[^@]+@/, 'mongodb://***:***@'));
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Try to get User model
    let User;
    try {
      User = mongoose.model('User');
    } catch (error) {
      // Create simple schema if model doesn't exist
      const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        phone: String,
        address: Object,
        createdAt: Date,
        updatedAt: Date
      });
      User = mongoose.model('User', userSchema);
    }
    
    // Get ALL users
    const allUsers = await User.find({});
    console.log(`\n📊 TOTAL USERS: ${allUsers.length}`);
    
    // Group by role
    const usersByRole = {};
    allUsers.forEach(user => {
      const role = user.role || 'user';
      if (!usersByRole[role]) usersByRole[role] = [];
      usersByRole[role].push(user);
    });
    
    // Show admins first
    console.log('\n👑 ADMIN USERS:');
    if (usersByRole.admin && usersByRole.admin.length > 0) {
      usersByRole.admin.forEach((admin, i) => {
        console.log(`\nAdmin ${i + 1}:`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Role: ${admin.role}`);
        console.log(`  ID: ${admin._id}`);
      });
    } else {
      console.log('No admin users found!');
    }
    
    // Show regular users
    console.log('\n👤 REGULAR USERS:');
    if (usersByRole.user && usersByRole.user.length > 0) {
      usersByRole.user.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.email})`);
      });
    }
    
    // Show users with other roles
    Object.keys(usersByRole).forEach(role => {
      if (role !== 'admin' && role !== 'user') {
        console.log(`\n🏷️  ${role.toUpperCase()} USERS:`);
        usersByRole[role].forEach((user, i) => {
          console.log(`${i + 1}. ${user.name} (${user.email})`);
        });
      }
    });
    
    // Search for specific emails
    console.log('\n🔍 SEARCHING FOR SPECIFIC EMAILS:');
    const searchEmails = [
      'superadmin@alora.com',
      'admin@alora.com', 
      'admin@gmail.com',
      'admin123@gmail.com'
    ];
    
    for (const email of searchEmails) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`✅ FOUND: ${email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
      } else {
        console.log(`❌ NOT FOUND: ${email}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAllUsers();