import { defineConfig } from "@playwright/test";

const baseURL = process.env.PW_BASE_URL || "http://localhost:5174";

export default defineConfig({
  testDir: "./tests",
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  // Run tests serially to avoid flakiness on Windows/dev server
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    // allow dev server to pick a free port if 5173 is occupied
    command: "npm run dev -- --host --port 5174",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
