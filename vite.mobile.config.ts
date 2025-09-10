import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-mobile',
    rollupOptions: {
      input: resolve(__dirname, 'mobile-index.html'),
    },
    target: 'es2015',
    minify: 'esbuild',
  },
  server: {
    port: 5173,
  },
  base: './',
  define: {
    global: 'globalThis',
  },
  plugins: [
    // Rename mobile-index.html to index.html during build
    {
      name: 'rename-to-index',
      generateBundle(options, bundle) {
        if (bundle['mobile-index.html']) {
          bundle['index.html'] = bundle['mobile-index.html'];
          delete bundle['mobile-index.html'];
        }
      }
    }
  ]
});