const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/alora', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixOrders() {
  try {
    console.log('🔧 Fixing orders in database...');
    
    // Get all orders
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders`);
    
    // Fix each order if needed
    for (const order of orders) {
      // Ensure customerInfo exists
      if (!order.customerInfo || !order.customerInfo.name) {
        console.log(`⚠️ Order ${order._id} has no customerInfo`);
        
        // Try to extract from user if exists
        if (order.user && order.user.name) {
          order.customerInfo = {
            name: order.user.name,
            email: order.user.email || '',
            phone: order.user.phone || ''
          };
          await order.save();
          console.log(`✅ Fixed order ${order._id}`);
        }
      }
    }
    
    console.log('✅ All orders checked and fixed if needed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing orders:', error);
    process.exit(1);
  }
}

fixOrders();