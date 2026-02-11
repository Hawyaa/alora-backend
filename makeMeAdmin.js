// filepath: c:\Users\Hawi\Desktop\alora\backend\scripts\makeMeAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
require('dotenv').config();

async function makeAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss');

    const adminEmail = "admin@gmail.com"; // Desired admin email
    const adminPassword = "admin123"; // Desired admin password

    console.log(`🔍 Looking for user: ${adminEmail}`);

    let user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User not found! Creating a new admin user...');

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Create a new admin user
      user = new User({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phone: "0900357453", // Optional phone number
        isActive: true,
      });

      await user.save();
      console.log('🎉 New admin user created successfully!');
    } else {
      console.log('✅ User found:', user.email);

      // Update the user's role to admin
      user.role = 'admin';
      await user.save();
      console.log('🎉 User promoted to ADMIN!');
    }

    console.log('User Details:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('\n🚀 Now you can login with the following credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

makeAdmin();