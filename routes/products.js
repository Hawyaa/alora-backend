const express = require('express');
const router = express.Router();

// Mock products data
const products = [
  {
    _id: '1',
    name: 'Glossy Lip Gloss',
    description: 'Shiny, non-sticky lip gloss with vitamin E',
    price: 24.99,
    images: ['/images/glossy-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 50,
    shades: [
      { name: 'Pink Blush', hexCode: '#FFB6C1' },
      { name: 'Berry Crush', hexCode: '#8B0000' },
      { name: 'Nude Bliss', hexCode: '#F5DEB3' }
    ]
  },
  {
    _id: '2',
    name: 'Matte Lip Gloss',
    description: 'Long-lasting matte finish lip gloss',
    price: 26.99,
    images: ['/images/matte-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 35,
    shades: [
      { name: 'Ruby Red', hexCode: '#DC143C' },
      { name: 'Mocha Brown', hexCode: '#8B4513' },
      { name: 'Coral Kiss', hexCode: '#FF7F50' }
    ]
  },
  {
    _id: '3',
    name: 'Plumping Lip Gloss',
    description: 'Volumizing lip gloss with hyaluronic acid',
    price: 29.99,
    images: ['/images/plumping-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 25,
    shades: [
      { name: 'Clear Shine', hexCode: '#F0F8FF' },
      { name: 'Rose Gold', hexCode: '#B76E79' },
      { name: 'Burgundy', hexCode: '#800020' }
    ]
  },
  {
    _id: '4',
    name: 'Glitter Lip Gloss',
    description: 'Sparkling glitter lip gloss for special occasions',
    price: 27.99,
    images: ['/images/glitter-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 40,
    shades: [
      { name: 'Crystal Clear', hexCode: '#F0F8FF' },
      { name: 'Pink Diamond', hexCode: '#FF69B4' },
      { name: 'Golden Sparkle', hexCode: '#FFD700' }
    ]
  },
  {
    _id: '5',
    name: 'Hydrating Lip Gloss',
    description: 'Moisturizing lip gloss with shea butter',
    price: 22.99,
    images: ['/images/hydrating-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 60,
    shades: [
      { name: 'Peach Nectar', hexCode: '#FFDAB9' },
      { name: 'Lavender Dream', hexCode: '#E6E6FA' },
      { name: 'Mauve Magic', hexCode: '#915F6D' }
    ]
  },
  {
    _id: '6',
    name: 'Long-Lasting Lip Gloss',
    description: 'Transfer-proof lip gloss that lasts all day',
    price: 31.99,
    images: ['/images/longlasting-lipgloss.jpg'],
    category: 'lipgloss',
    inStock: true,
    stockQuantity: 30,
    shades: [
      { name: 'Wine Stain', hexCode: '#722F37' },
      { name: 'Cinnamon Spice', hexCode: '#D2691E' },
      { name: 'Deep Plum', hexCode: '#701C1C' }
    ]
  }
];

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all products');
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Fetching product:', productId);
    
    const product = products.find(p => p._id === productId);
    
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
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

module.exports = router;