import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'motion': ['gsap', 'motion', 'lenis']
        }
      }
    },
    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Limit chunk size
    chunkSizeWarningLimit: 1000,
    modulePreload: false
  },
  server: {
    port: 5174,
    open: false,
  }
});
