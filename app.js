// Add sample products route (temporary)
app.post('/api/create-sample-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
    // Clear existing products
    await Product.deleteMany({});
    
    const products = await Product.create([
      {
        name: "Matte Lipstick - Ruby Red",
        description: "Long-lasting matte lipstick with vibrant color",
        price: 450,
        category: "Lipstick",
        images: ["ruby_red.jpg"],
        shades: [
          { name: "Ruby Red", code: "RR001", hexColor: "#FF0000" },
          { name: "Pink Bliss", code: "PB002", hexColor: "#FF69B4" }
        ],
        stockQuantity: 50
      },
      {
        name: "Lip Gloss - Clear Shine",
        description: "Non-sticky lip gloss with shiny finish",
        price: 320,
        category: "Lip Gloss", 
        images: ["clear_gloss.jpg"],
        shades: [
          { name: "Clear", code: "CL001", hexColor: "#FFF" },
          { name: "Pink Sparkle", code: "PS002", hexColor: "#FFB6C1" }
        ],
        stockQuantity: 30
      },
      {
        name: "Lip Liner - Natural Brown",
        description: "Precision lip liner for defined lips",
        price: 280,
        category: "Lip Liner",
        images: ["brown_liner.jpg"],
        shades: [
          { name: "Natural Brown", code: "NB003", hexColor: "#8B4513" },
          { name: "Dark Plum", code: "DP004", hexColor: "#701C63" }
        ],
        stockQuantity: 25
      }
    ]);
    
    res.json({ 
      success: true, 
      message: 'Sample products created!',
      products 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});