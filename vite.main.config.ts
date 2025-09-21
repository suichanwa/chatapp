import { defineConfig } from 'vite';

// https://vitejs.dev/config
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
        'child_process'
      ]
    },
    outDir: '.vite/build',
    emptyOutDir: false // Don't empty since preload.js will also be here
  }
});