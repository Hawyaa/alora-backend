const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
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
      required: true,
      min: 0
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
    }
  }],
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
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
  
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Ethiopia'
    }
  },
  
  notes: String,
  
  orderNumber: {
    type: String,
    unique: true
  }
  
}, {
  timestamps: true
});

// FIX 1: Use SIMPLE version (no 'next' parameter at all)
orderSchema.pre('save', function() {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  // NO next() call needed
});

// FIX 2: OR if you need async operations
// orderSchema.pre('save', async function() {
//   if (!this.orderNumber) {
//     const date = new Date();
//     const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
//     const random = Math.random().toString(36).substring(2, 8).toUpperCase();
//     this.orderNumber = `ORD-${dateStr}-${random}`;
//   }
// });

// FIX 3: If you MUST use next(), do it correctly
// orderSchema.pre('save', function(next) {
//   if (!this.orderNumber) {
//     const date = new Date();
//     const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
//     const random = Math.random().toString(36).substring(2, 8).toUpperCase();
//     this.orderNumber = `ORD-${dateStr}-${random}`;
//   }
//   next(); // Parameter name MUST match function call
// });

// Add indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customerInfo.email': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;