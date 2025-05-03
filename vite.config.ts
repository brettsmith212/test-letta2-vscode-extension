// This file configures Vite for building the React webview application for the Claude chat VSCode extension, located at the project root, with a custom entry point.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'webviews',
  build: {
    outDir: '../media/build',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'webviews/index.tsx'),
      output: {
        entryFileNames: 'assets/index.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'webviews')
    }
  },
  base: './'
});