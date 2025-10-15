import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types.ts',
        'src/cli.ts', // Entry point, hard to test
        'src/index.ts', // Re-exports only
        'src/__mocks__/**', // Mock files
        'src/mcp/index.ts', // Registration only, tested via integration
      ],
    },
    setupFiles: [],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
});
