import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function syncPublishAndLaragonBuildPlugin() {
  return {
    name: 'sync-publish-and-laragon-build',
    closeBundle() {
      try {
        const rootDir = __dirname;
        const publicDir = path.resolve(rootDir, 'public');
        const publicBuildDir = path.resolve(publicDir, 'build');
        const distDir = path.resolve(rootDir, 'dist');

        if (!fs.existsSync(distDir)) return;

        // 1. Copy public/sw.js and public/robots.txt into dist/ so root static serving has them
        for (const staticFile of ['sw.js', 'robots.txt']) {
          const srcFile = path.resolve(publicDir, staticFile);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, path.resolve(distDir, staticFile));
          }
        }

        // 2. Ensure dist/build/assets also exists as fallback
        const distAssets = path.resolve(distDir, 'assets');
        if (fs.existsSync(distAssets)) {
          const distBuildAssets = path.resolve(distDir, 'build', 'assets');
          fs.mkdirSync(distBuildAssets, { recursive: true });
          fs.cpSync(distAssets, distBuildAssets, { recursive: true, force: true });
        }

        // 3. Mirror dist/ to public/build/ so Laragon (@vite manifest.json) and server.ts both have complete assets
        fs.mkdirSync(publicBuildDir, { recursive: true });
        fs.cpSync(distDir, publicBuildDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('Warning syncing build directories:', err);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  if (isBuild) {
    // Force production mode before initializing @vitejs/plugin-react so it never emits jsxDEV (which is undefined in React 19 production bundle)
    process.env.NODE_ENV = 'production';
  }
  const nodeEnv = isBuild ? 'production' : (process.env.NODE_ENV || 'development');

  return {
    base: '/',
    mode: isBuild ? 'production' : 'development',
    publicDir: false,
    plugins: [
      react(),
      tailwindcss(),
      syncPublishAndLaragonBuildPlugin(),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'process.env': JSON.stringify({ NODE_ENV: nodeEnv }),
      'global': 'window',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      manifest: 'manifest.json',
      outDir: 'dist',
      emptyOutDir: true,
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
  };
});


