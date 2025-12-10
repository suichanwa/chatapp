import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: [
        'electron', 
        'path', 
        'fs', 
        'crypto', 
        'os', 
        'node:path', 
        'node:fs/promises', 
        'node:crypto', 
        'node:os',
        'net',
        'child_process',
        'tailwindcss', // External so main process doesn't try to bundle it
        'autoprefixer'
      ]
    },
    outDir: '.vite/build',
    emptyOutDir: false, // Don't empty since preload.js will also be here
    // Disable CSS processing for main process
    cssCodeSplit: false,
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  // No CSS config for main process
});