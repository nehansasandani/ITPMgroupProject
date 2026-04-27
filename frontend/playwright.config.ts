import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: 'off',
  },
  webServer: {
    command: 'node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js',
    port: 5173,
    reuseExistingServer: true,
    timeout: 180000,
  },
});
