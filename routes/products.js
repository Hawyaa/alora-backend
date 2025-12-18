const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import Product model

// GET /api/products - Get all products FROM DATABASE
router.get('/', async (req, res) => {
  try {
    console.log('📦 Fetching all products from database...');
    
    // Get all products from MongoDB
    const products = await Product.find();
    
    console.log(`✅ Found ${products.length} products`);
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/:id - Get single product FROM DATABASE
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('📦 Fetching product:', productId);
    
    // Find product by ID in MongoDB
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

module.exports = router;