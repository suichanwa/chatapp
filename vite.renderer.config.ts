import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-renderer',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    emptyOutDir: true,
  },
  server: {
    port: 0, // Use 0 for random port assignment
    strictPort: false, // Allow fallback to other ports
    host: '127.0.0.1', // Bind to localhost for security
  },
  base: './',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf'],
});