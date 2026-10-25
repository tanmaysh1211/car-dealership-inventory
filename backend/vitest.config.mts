import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['src/tests/globalSetup.ts'],
    setupFiles: ['src/tests/setup.ts'],
    // All test files share one Postgres test database, so run files one at a time.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/tests/**', 'src/server.ts', 'src/db/seed.ts', 'src/db/migrate.ts', 'src/types/**'],
      reporter: ['text', 'html'],
    },
  },
});
