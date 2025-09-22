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
    port: 5173,
    strictPort: true,
  },
  base: './',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf'],
});