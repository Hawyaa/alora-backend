const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  shade: {
    type: String,
    default: 'default'
  },
  image: {
    type: String
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for total amount
cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;