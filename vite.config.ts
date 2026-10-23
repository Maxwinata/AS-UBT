import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  publicDir: false,
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.tsx',
      ],
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env': {},
    'global': 'window',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    manifest: 'manifest.json',
    outDir: 'public/build',
    emptyOutDir: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'index.html'),
        'resources/js/app': path.resolve(__dirname, 'resources/js/app.tsx'),
        'resources/css/app': path.resolve(__dirname, 'resources/css/app.css'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Isolasi modul AI dan OCR yang sangat berat (~1.8 MB)
            if (id.includes('@tensorflow') || id.includes('tesseract.js')) {
              return 'vendor-ai';
            }
            // Isolasi modul scanner dan PDF generator (~400 KB)
            if (id.includes('jspdf') || id.includes('html5-qrcode') || id.includes('react-signature-canvas')) {
              return 'vendor-doc';
            }
          }
        },
      },
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
