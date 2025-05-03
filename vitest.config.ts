import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // VS Code extension tests require special mocking
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      'vscode': resolve(__dirname, './test/vscode-mock.ts')
    },
  },
});