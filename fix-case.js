// backend/fix-case.js
const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING ORDER.JS SCHEMA CASE\n');

const filePath = path.join(__dirname, 'models', 'Order.js');
let content = fs.readFileSync(filePath, 'utf8');

// Count occurrences
const orderSchemaCount = (content.match(/OrderSchema/g) || []).length;
const orderSchemaLowerCount = (content.match(/orderSchema/g) || []).length;

console.log(`📊 Counts:`);
console.log(`  OrderSchema (uppercase): ${orderSchemaCount}`);
console.log(`  orderSchema (lowercase): ${orderSchemaLowerCount}`);

if (orderSchemaCount > orderSchemaLowerCount) {
  // More uppercase - change all lowercase to uppercase
  console.log('🔄 Converting lowercase to uppercase...');
  const newContent = content.replace(/orderSchema/g, 'OrderSchema');
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Fixed: Changed all "orderSchema" to "OrderSchema"');
} else if (orderSchemaLowerCount > orderSchemaCount) {
  // More lowercase - change all uppercase to lowercase
  console.log('🔄 Converting uppercase to lowercase...');
  const newContent = content.replace(/OrderSchema/g, 'orderSchema');
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Fixed: Changed all "OrderSchema" to "orderSchema"');
} else {
  console.log('⚠️  Equal counts. Checking first occurrence...');
  
  // Find the schema definition
  const schemaDefMatch = content.match(/(const|let|var)\s+(\w+)\s*=\s*new\s+mongoose\.Schema/);
  if (schemaDefMatch) {
    const varName = schemaDefMatch[2];
    console.log(`📌 Schema is defined as: ${varName}`);
    
    // Standardize to this variable name
    if (varName === 'OrderSchema') {
      const newContent = content.replace(/orderSchema/g, 'OrderSchema');
      fs.writeFileSync(filePath, newContent);
      console.log('✅ Standardized to "OrderSchema"');
    } else if (varName === 'orderSchema') {
      const newContent = content.replace(/OrderSchema/g, 'orderSchema');
      fs.writeFileSync(filePath, newContent);
      console.log('✅ Standardized to "orderSchema"');
    }
  }
}

console.log('\n🔄 Restart your server with: npm run dev');