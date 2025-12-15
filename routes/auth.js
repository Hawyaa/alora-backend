const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Fixed: Import from the correct model file

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log('Registration attempt for:', email);

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password BEFORE creating user (no pre-save hook)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword, // Use already hashed password
      phone: phone || '',
      role: 'user'
    });

    await user.save();
    console.log('User created successfully:', email);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || {}
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => { // Added the 'auth' middleware
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user data'
    });
  }
});

// Verify token endpoint
router.get('/verify', auth, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user.userId, // Use 'userId' from the token payload
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;