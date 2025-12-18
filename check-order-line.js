// Create backend/check-order-line.js
const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING LINE 109 OF Order.js\n');

const modelPath = path.join(__dirname, 'models', 'Order.js');

if (!fs.existsSync(modelPath)) {
  console.log('❌ Order.js not found!');
  process.exit(1);
}

const content = fs.readFileSync(modelPath, 'utf8');
const lines = content.split('\n');

console.log('📄 Total lines in file:', lines.length);

if (lines.length >= 109) {
  console.log('\n📋 LINE 109:');
  console.log('='.repeat(80));
  console.log(`109: ${lines[108]}`);
  console.log('='.repeat(80));
  
  console.log('\n📋 CONTEXT (lines 105-115):');
  for (let i = 104; i < 115 && i < lines.length; i++) {
    console.log(`${(i + 1).toString().padStart(4)}: ${lines[i]}`);
  }
} else {
  console.log('❌ File has less than 109 lines!');
}