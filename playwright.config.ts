import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Axanar Campaign Tracker Nexus testing
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  testIgnore: ["tests/unit/**"],
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. */
  reporter: [["html"], ["list"]],
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "phase1-audit",
      testDir: "./tests/phase1",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:8080",
      },
    },
  ],
  /* Start a dev server for E2E — reuse if already running */
  webServer: {
    command: "npm run dev",
    port: 8080,
    reuseExistingServer: true,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:8080",
    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",
  },
});
