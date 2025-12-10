import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js'
    },
    rollupOptions: {
      external: [
        'electron',
        '@electron-fonts/material-icons',
        'tailwindcss', // External so preload doesn't try to bundle it
        'autoprefixer'
      ]
    },
    outDir: '.vite/build',
    emptyOutDir: false, // Don't empty the dir since main.js is also there
    // Disable CSS processing for preload
    cssCodeSplit: false,
  },
  // No CSS config for preload
});