import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test';
  return {
    plugins: [react()],
    define: isTest ? { 'process.env.NODE_ENV': JSON.stringify('test') } : {},
    resolve: {
      conditions: isTest ? ['development', 'browser'] : [],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
      mode: 'test',
    },
  };
});
