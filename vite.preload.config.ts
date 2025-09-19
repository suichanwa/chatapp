import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js'
    },
    rollupOptions: {
      external: ['electron']
    },
    // FIX: match main’s single-level outDir
    outDir: '.vite/build', // keep in sync with main
    emptyOutDir: true
  }
});