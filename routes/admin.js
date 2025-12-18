const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders for admin dashboard
router.get('/orders', async (req, res) => {
  try {
    console.log('📊 Admin fetching all orders...');
    
    // Get all orders
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for admin`);
    
    // Format orders for admin view
    const formattedOrders = orders.map(order => {
      // Calculate total for each item
      const itemsWithTotals = order.items.map(item => {
        return {
          name: item.name || 'Unknown Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
          shade: item.shade || 'default',
          total: (item.price || 0) * (item.quantity || 1)
        };
      });

      const customerInfo = order.customerInfo || {};
      
      // Convert _id to string for substring operation
      const orderId = order._id ? order._id.toString() : '';
      const orderNumber = order.orderNumber || `ORD-${orderId.substring(0, 8).toUpperCase()}`;
      
      return {
        _id: orderId,
        orderNumber: orderNumber,
        // Return as customerInfo (matching Order model)
        customerInfo: {
          name: customerInfo.name || 'Guest Customer',
          email: customerInfo.email || 'No email provided',
          phone: customerInfo.phone || 'No phone provided'
        },
        items: itemsWithTotals,
        totalAmount: order.totalAmount || 0,
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod || 'cash',
        deliveryAddress: order.deliveryAddress || {},
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    res.json({
      success: true,
      count: orders.length,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('❌ Admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    console.log('📈 Admin fetching dashboard stats...');
    
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Get orders by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Get recent orders (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingOrders,
        completedOrders,
        cancelledOrders,
        recentOrders,
        totalCustomers,
        chartData: {
          labels: ['Pending', 'Completed', 'Cancelled'],
          data: [pendingOrders, completedOrders, cancelledOrders]
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log(`✅ Updated order ${id} status to ${status}`);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
    
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

module.exports = router;