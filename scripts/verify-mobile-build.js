const fs = require('fs');
const path = require('path');

const distDir = 'dist-mobile';
const indexPath = path.join(distDir, 'index.html');
const mobileIndexPath = path.join(distDir, 'mobile-index.html');

console.log('🔍 Verifying mobile build...');

// Check if dist-mobile directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist-mobile directory does not exist');
  process.exit(1);
}

console.log('✅ dist-mobile directory exists');

// List all files in dist-mobile
const files = fs.readdirSync(distDir, { recursive: true });
console.log('📁 Files in dist-mobile:', files);

// Check for index.html
if (fs.existsSync(indexPath)) {
  console.log('✅ index.html exists');
} else {
  console.log('❌ index.html missing');
  
  // Try to create it from mobile-index.html
  if (fs.existsSync(mobileIndexPath)) {
    console.log('📋 Copying mobile-index.html to index.html');
    fs.copyFileSync(mobileIndexPath, indexPath);
    console.log('✅ index.html created');
  } else {
    console.error('❌ Neither index.html nor mobile-index.html found');
    process.exit(1);
  }
}

// Verify index.html content
const indexContent = fs.readFileSync(indexPath, 'utf-8');
if (indexContent.includes('mobile-renderer.ts') || indexContent.includes('MobileChatApp')) {
  console.log('✅ index.html contains mobile content');
} else {
  console.log('⚠️ index.html might not contain mobile content');
}

console.log('🎉 Mobile build verification complete');