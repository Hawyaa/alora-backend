const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for guest orders
  },
  orderNumber: {
    type: String,
    unique: true,
    default: () => `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Allow null for guest orders
    },
    productId: String, // Store the original ID as string
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: String,
    shade: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);