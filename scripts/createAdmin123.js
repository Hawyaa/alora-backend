const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (matches your existing model)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  phone: String,
  role: { type: String, default: 'user' },
  address: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Wait for connection
    await mongoose.connection.once('open', () => {
      console.log('✅ Connected to MongoDB');
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin123@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists. Updating password...');
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.name = 'Admin User';
      await existingAdmin.save();
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin123@gmail.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    } else {
      console.log('🆕 Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin123@gmail.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'admin',
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'AS',
          zipCode: '12345',
          country: 'Admin Country'
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin123@gmail.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
    }
    
    // List all admin users
    console.log('\n📋 Listing all admin users:');
    const adminUsers = await User.find({ role: 'admin' });
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Close connection
    mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the function
createAdminUser();