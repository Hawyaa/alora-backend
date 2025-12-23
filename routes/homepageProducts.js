const express = require('express');
const router = express.Router();
const HomepageProduct = require('../models/HomepageProduct');
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');

// GET all homepage products with product details (Public)
router.get('/', async (req, res) => {
  try {
    const homepageProducts = await HomepageProduct.find({ isActive: true })
      .populate('productId')
      .sort({ position: 1 });

    // Filter out products that might have been deleted
    const validProducts = homepageProducts.filter(hp => hp.productId);
    
    res.json({
      success: true,
      products: validProducts.map(hp => hp.productId)
    });
  } catch (error) {
    console.error('Error fetching homepage products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch homepage products' 
    });
  }
});

// ADD product to homepage (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if already added to homepage
    const existing = await HomepageProduct.findOne({ productId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Product is already on homepage'
      });
    }

    // Get current max position
    const lastProduct = await HomepageProduct.findOne().sort({ position: -1 });
    const newPosition = lastProduct ? lastProduct.position + 1 : 0;

    // Create homepage product entry
    const homepageProduct = new HomepageProduct({
      productId,
      position: newPosition,
      addedBy: req.user.id
    });

    await homepageProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product added to homepage successfully',
      homepageProduct
    });
  } catch (error) {
    console.error('Error adding product to homepage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add product to homepage' 
    });
  }
});

// REMOVE product from homepage (Admin only)
router.delete('/:productId', adminAuth, async (req, res) => {
  try {
    const homepageProduct = await HomepageProduct.findOneAndDelete({
      productId: req.params.productId
    });

    if (!homepageProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found on homepage'
      });
    }

    // Reorder remaining products
    await reorderHomepageProducts();

    res.json({
      success: true,
      message: 'Product removed from homepage successfully'
    });
  } catch (error) {
    console.error('Error removing product from homepage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove product from homepage' 
    });
  }
});

// TOGGLE homepage product active status (Admin only)
router.put('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const homepageProduct = await HomepageProduct.findById(req.params.id);
    
    if (!homepageProduct) {
      return res.status(404).json({
        success: false,
        error: 'Homepage product not found'
      });
    }

    homepageProduct.isActive = !homepageProduct.isActive;
    await homepageProduct.save();

    res.json({
      success: true,
      message: `Product ${homepageProduct.isActive ? 'activated' : 'deactivated'} on homepage`,
      homepageProduct
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle product status' 
    });
  }
});

// MOVE product position (Admin only)
router.put('/:id/move', adminAuth, async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    const homepageProduct = await HomepageProduct.findById(req.params.id);
    
    if (!homepageProduct) {
      return res.status(404).json({
        success: false,
        error: 'Homepage product not found'
      });
    }

    // Find the product to swap with
    let swapProduct;
    if (direction === 'up') {
      swapProduct = await HomepageProduct.findOne({ 
        position: homepageProduct.position - 1 
      });
    } else if (direction === 'down') {
      swapProduct = await HomepageProduct.findOne({ 
        position: homepageProduct.position + 1 
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid direction. Use "up" or "down"'
      });
    }

    if (!swapProduct) {
      return res.status(400).json({
        success: false,
        error: `Cannot move product ${direction}`
      });
    }

    // Swap positions
    const tempPosition = homepageProduct.position;
    homepageProduct.position = swapProduct.position;
    swapProduct.position = tempPosition;

    await homepageProduct.save();
    await swapProduct.save();

    res.json({
      success: true,
      message: `Product moved ${direction} successfully`
    });
  } catch (error) {
    console.error('Error moving product:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to move product' 
    });
  }
});

// GET all homepage products for admin (including inactive)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const homepageProducts = await HomepageProduct.find()
      .populate('productId')
      .sort({ position: 1 });

    res.json({
      success: true,
      homepageProducts
    });
  } catch (error) {
    console.error('Error fetching homepage products for admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch homepage products' 
    });
  }
});

// Helper function to reorder products after deletion
async function reorderHomepageProducts() {
  const products = await HomepageProduct.find().sort({ position: 1 });
  
  for (let i = 0; i < products.length; i++) {
    products[i].position = i;
    await products[i].save();
  }
}

module.exports = router;