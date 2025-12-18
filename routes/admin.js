const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product'); // Add this import

// ==================== ORDER MANAGEMENT ====================

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
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Calculate completed orders (delivered)
    const completedOrders = deliveredOrders;
    
    // Get recent orders (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // 🔥 FIX: Get UNIQUE customers who have placed orders
    // This counts distinct customers by email from completed orders
    const uniqueCustomersResult = await Order.aggregate([
      {
        $match: {
          'customerInfo.email': { 
            $exists: true,
            $ne: null,
            $nin: ['', 'No email provided', 'admin@gmail.com']
          }
        }
      },
      {
        $group: {
          _id: '$customerInfo.email'
        }
      },
      {
        $count: 'totalCustomers'
      }
    ]);
    
    const totalCustomers = uniqueCustomersResult[0]?.totalCustomers || 0;
    
    // Alternative: Count all orders with valid customer emails
    const ordersWithCustomers = await Order.countDocuments({
      'customerInfo.email': { 
        $exists: true,
        $ne: null,
        $nin: ['', 'No email provided', 'admin@gmail.com']
      }
    });
    
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get low stock products (less than 5 in stock)
    const lowStockProducts = await Product.countDocuments({
      stockQuantity: { $lt: 5 },
      inStock: true
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        completedOrders,
        recentOrders,
        totalCustomers, // ✅ Now shows customers who actually placed orders
        ordersWithCustomers, // Total orders with customer info
        totalProducts,
        lowStockProducts,
        chartData: {
          labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          data: [pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders]
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

// ==================== PRODUCT MANAGEMENT ====================

// Get all products (admin view)
router.get('/products', async (req, res) => {
  try {
    console.log('📦 Admin fetching all products...');
    
    const products = await Product.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    
    res.json({
      success: true,
      count: products.length,
      products
    });
    
  } catch (error) {
    console.error('❌ Admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    console.log('🆕 Admin creating new product...');
    console.log('Product data:', req.body);
    
    const {
      name,
      description,
      price,
      category,
      images,
      inStock,
      stockQuantity,
      shades
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required'
      });
    }
    
    // Create product object matching your schema
    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      images: images || ['/placeholder-product.jpg'],
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
      shades: shades || []
    };
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log(`✅ Product created: ${savedProduct.name} (${savedProduct._id})`);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });
    
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`✏️ Admin updating product: ${id}`);
    console.log('Update data:', updateData);
    
    // Convert numeric fields if provided
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log(`✅ Product updated: ${product.name}`);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
    
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Admin deleting product: ${id}`);
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log(`✅ Product deleted: ${product.name}`);
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      product
    });
    
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Get single product (admin view)
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📦 Admin fetching product: ${id}`);
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
    
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

module.exports = router;