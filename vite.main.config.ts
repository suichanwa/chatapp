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
      external: ['electron', 'path', 'fs', 'crypto', 'os', 'node:path', 'node:fs/promises', 'node:crypto', 'node:os']
    },
    // FIX: avoid nested outDir that requires a missing parent
    outDir: '.vite/build', // revert to Forge’s expected path
    emptyOutDir: true
  }
});