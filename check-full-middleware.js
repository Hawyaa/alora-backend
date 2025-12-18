// Create backend/check-full-middleware.js
const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING FULL MIDDLEWARE STRUCTURE\n');

const modelPath = path.join(__dirname, 'models', 'Order.js');
const content = fs.readFileSync(modelPath, 'utf8');
const lines = content.split('\n');

console.log('📋 Lines 95-115:');
console.log('='.repeat(80));
for (let i = 94; i < 115 && i < lines.length; i++) {
  console.log(`${(i + 1).toString().padStart(4)}: ${lines[i]}`);
}
console.log('='.repeat(80));

console.log('\n📋 Looking for middleware definition:');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.pre(') && i < 105) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    // Show next few lines
    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
      console.log(`  ${(j + 1).toString().padStart(4)}: ${lines[j]}`);
    }
    break;
  }
}