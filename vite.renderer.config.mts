import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
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