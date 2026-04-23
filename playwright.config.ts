import { defineConfig } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local (gitignored) so secrets are available at test runtime.
// ??= preserves values already injected by CI.
const envLocalPath = resolve('.env.local');
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^=#\s]+)\s*=\s*(.+)$/);
    if (m) process.env[m[1]] ??= m[2].trim();
  }
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  timeout: 15_000,

  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://api.mockfly.dev/mocks/cab5e087-09ad-424c-b618-52f3993993f0',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY ?? '',
    },
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'api', use: {} },
  ],
});