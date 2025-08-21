import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import vitePluginSingleFile from './vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), vitePluginSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-hot-toast': path.resolve(__dirname, 'node_modules/react-hot-toast/dist/index.js'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // This ensures that all routes are handled by index.html for SPA routing
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['react-hot-toast', '@heroicons/react/24/outline'],
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hot-toast',
      '@heroicons/react/24/outline'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
