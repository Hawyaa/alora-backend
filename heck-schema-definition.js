// backend/check-schema-definition.js
const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING SCHEMA DEFINITION\n');

const modelPath = path.join(__dirname, 'models', 'Order.js');
const content = fs.readFileSync(modelPath, 'utf8');
const lines = content.split('\n');

console.log('📋 First 20 lines of Order.js:');
console.log('='.repeat(80));
for (let i = 0; i < 20 && i < lines.length; i++) {
  console.log(`${(i + 1).toString().padStart(4)}: ${lines[i]}`);
}
console.log('='.repeat(80));

// Look for schema definition
console.log('\n🔎 Looking for schema variable name:');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('new mongoose.Schema') || lines[i].includes('new Schema')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    
    // Check the variable name
    const prevLine = i > 0 ? lines[i-1].trim() : '';
    if (prevLine.includes('const') || prevLine.includes('let') || prevLine.includes('var')) {
      console.log(`📌 Schema variable likely defined in line ${i}: ${prevLine}`);
    }
    break;
  }
}