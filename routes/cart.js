const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock products data (same as in products route)
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

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// In-memory cart storage
const userCarts = new Map();

// GET /api/cart - Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = userCarts.get(userId) || { items: [] };

    console.log(`Fetching cart for user ${userId}, items: ${cart.items.length}`);

    res.json({
      success: true,
      cart: {
        items: cart.items
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, shade = null } = req.body;
    const userId = req.user.userId;

    console.log(`Add to cart request from user ${userId}:`, { productId, quantity, shade });

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Find the actual product
    const product = products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get or create cart for user
    let cart = userCarts.get(userId);
    if (!cart) {
      cart = { items: [] };
      userCarts.set(userId, cart);
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product._id === productId && 
      (!shade || item.shade?.name === shade?.name)
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += parseInt(quantity);
      console.log('Updated existing item quantity');
    } else {
      // Add new item to cart with actual product data
      const newItem = {
        _id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product: {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.images[0],
          category: product.category
        },
        quantity: parseInt(quantity),
        shade: shade,
        price: product.price,
        addedAt: new Date().toISOString()
      };
      cart.items.push(newItem);
      console.log('Added new item to cart:', product.name);
    }

    console.log(`Cart updated for user ${userId}. Total items: ${cart.items.length}`);

    res.json({
      success: true,
      message: 'Product added to cart successfully',
      cart: {
        items: cart.items
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/update - Update item quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.userId;

    console.log(`Update cart item:`, { itemId, quantity });

    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and quantity are required'
      });
    }

    const cart = userCarts.get(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        items: cart.items
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.userId;

    console.log(`Remove item from cart:`, { itemId });

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
    }

    const cart = userCarts.get(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id !== itemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        items: cart.items
      }
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart/clear - Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    userCarts.set(userId, { items: [] });

    console.log(`Cart cleared for user ${userId}`);

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: []
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

module.exports = router;