import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, copyFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist-mobile');
const mobileIndexPath = join(distDir, 'mobile-index.html');
const indexPath = join(distDir, 'index.html');

console.log('📋 Copying mobile-index.html to index.html...');

if (existsSync(mobileIndexPath)) {
  copyFileSync(mobileIndexPath, indexPath);
  console.log('✓ Successfully copied mobile-index.html to index.html');
  console.log(`  Source: ${mobileIndexPath}`);
  console.log(`  Destination: ${indexPath}`);
} else {
  console.error('✗ Error: mobile-index.html not found in dist-mobile');
  console.error(`  Expected path: ${mobileIndexPath}`);
  process.exit(1);
}