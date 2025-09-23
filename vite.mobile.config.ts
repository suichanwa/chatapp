import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-mobile',
    rollupOptions: {
      input: resolve(__dirname, 'mobile-index.html'),
      external: [
        // Don't try to bundle Capacitor plugins at build time
        '@capacitor/camera',
        '@capacitor/core',
      ],
    },
    target: 'es2015',
    minify: 'esbuild',
  },
  server: {
    port: 0, // Use random port for mobile dev server too
    strictPort: false,
    host: '127.0.0.1',
  },
  base: './',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    // Exclude Capacitor plugins from pre-bundling
    exclude: ['@capacitor/camera', '@capacitor/core']
  },
  plugins: [
    // Rename mobile-index.html to index.html during build
    {
      name: 'rename-mobile-index',
      generateBundle(options, bundle) {
        const mobileIndexHtml = bundle['mobile-index.html'];
        if (mobileIndexHtml && mobileIndexHtml.type === 'asset') {
          // Rename to index.html for mobile build
          bundle['index.html'] = {
            ...mobileIndexHtml,
            fileName: 'index.html'
          };
          delete bundle['mobile-index.html'];
        }
      },
    }
  ],
});