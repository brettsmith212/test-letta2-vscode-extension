import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // VS Code extension tests require special mocking
    setupFiles: ['./test/setup.ts'],
    testTimeout: 120000 // 2 minutes timeout for integration tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      'vscode': resolve(__dirname, './test/vscode-mock.ts')
    },
  },
});