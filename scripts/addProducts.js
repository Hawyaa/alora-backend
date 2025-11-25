const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const sampleProducts = [
  {
    name: "Glossy Shine Lip Gloss",
    description: "High-shine lip gloss with hydrating formula",
    price: 15.99,
    images: ["/images/glossy-shine.jpg"],
    category: "lipgloss",
    stockQuantity: 50,
    features: ["Hydrating", "Long-lasting", "Non-sticky"],
    shades: [
      { name: "Pink Blush", code: "#FFB6C1", inStock: true },
      { name: "Berry Crush", code: "#8B0000", inStock: true }
    ]
  },
  {
    name: "Matte Liquid Lipstick", 
    description: "Velvet matte finish liquid lipstick",
    price: 18.99,
    images: ["/images/matte-liquid.jpg"],
    category: "lipstick",
    stockQuantity: 30,
    features: ["Matte Finish", "Transfer-proof", "Comfortable wear"],
    shades: [
      { name: "Nude Perfection", code: "#F5D0C4", inStock: true },
      { name: "Red Velvet", code: "#B22222", inStock: true }
    ]
  }
];

async function addProducts() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  const products = await Product.insertMany(sampleProducts);
  console.log('Added products:', products.map(p => ({ id: p._id, name: p.name })));
  process.exit();
}

addProducts();