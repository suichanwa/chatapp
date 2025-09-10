import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-renderer',
  },
  server: {
    port: 5173
  }
});
