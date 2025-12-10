import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  build: {
    outDir: 'dist-mobile',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'mobile-index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});