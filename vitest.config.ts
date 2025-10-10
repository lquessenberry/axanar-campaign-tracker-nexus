import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup-unit.ts'],
    include: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx',
    ],
    exclude: [
      'tests/e2e/**',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'node_modules/**',
      'dist/**',
    ],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
