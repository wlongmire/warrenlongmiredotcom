import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './support/env';

// The tests start their own copy of the site (see scripts/serve.mjs), so nothing here touches your real
// content, your .env, GitHub, or the live contact form.
export default defineConfig({
  testDir: './specs',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    { name: 'site', testDir: './specs/site', testIgnore: /mobile/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'site-mobile', testDir: './specs/site', testMatch: /mobile/, use: { ...devices['Pixel 7'] } },
    { name: 'editor', testDir: './specs/editor', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
  ],
});
