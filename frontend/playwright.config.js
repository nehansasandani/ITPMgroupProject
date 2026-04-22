import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --host --port 5173 --strictPort",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
