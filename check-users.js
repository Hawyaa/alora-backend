const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alora-lipgloss')
  .then(async () => {
    const User = require('./models/User');
    const users = await User.find({});
    console.log('📋 All users in database:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.name} (${user.role})`);
    });
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });