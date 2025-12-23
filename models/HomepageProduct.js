const mongoose = require('mongoose');

const HomepageProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure one product can only be added once to homepage
HomepageProductSchema.index({ productId: 1 }, { unique: true });

module.exports = mongoose.model('HomepageProduct', HomepageProductSchema);