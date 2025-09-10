import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-renderer',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    // Ensure proper base path for production
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  // Important: set base to relative path for production
  base: './',
});