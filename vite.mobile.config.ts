import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-mobile',
    rollupOptions: {
      input: resolve(__dirname, 'mobile-index.html'),
      external: [
        // Don't try to bundle Capacitor plugins at build time
        '@capacitor/camera',
        '@capacitor/core',
      ],
    },
    target: 'es2015',
    minify: 'esbuild',
  },
  server: {
    port: 5174, // Different port from main app
  },
  base: './',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    // Exclude Capacitor plugins from pre-bundling
    exclude: ['@capacitor/camera', '@capacitor/core']
  },
  plugins: [
    // Rename mobile-index.html to index.html during build
    {
      name: 'rename-mobile-index',
      generateBundle(options, bundle) {
        // Find the mobile-index.html file and rename it
        const mobileIndexKey = Object.keys(bundle).find(key => 
          key.includes('mobile-index.html') || key === 'mobile-index.html'
        );
        
        if (mobileIndexKey && bundle[mobileIndexKey]) {
          // Create new index.html entry
          bundle['index.html'] = bundle[mobileIndexKey];
          // Remove the old entry
          delete bundle[mobileIndexKey];
          console.log('✅ Renamed mobile-index.html to index.html');
        } else {
          console.log('❌ mobile-index.html not found in bundle keys:', Object.keys(bundle));
        }
      },
      
      // Alternative approach: use writeBundle hook
      writeBundle(options, bundle) {
        const fs = require('fs');
        const path = require('path');
        
        const distDir = options.dir || 'dist-mobile';
        const mobileIndexPath = path.join(distDir, 'mobile-index.html');
        const indexPath = path.join(distDir, 'index.html');
        
        // Check if mobile-index.html exists and copy it to index.html
        if (fs.existsSync(mobileIndexPath)) {
          fs.copyFileSync(mobileIndexPath, indexPath);
          console.log('✅ Copied mobile-index.html to index.html');
        } else {
          console.log('❌ mobile-index.html not found at:', mobileIndexPath);
        }
      }
    }
  ]
});