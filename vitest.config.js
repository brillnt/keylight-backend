// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tell Vitest to run this file before all tests
    setupFiles: ['./tests/setup.js'],
    
    // Disable parallel execution to prevent database race conditions
    threads: false,
  },
});