import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Axanar Campaign Tracker Nexus testing
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 5000
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
  reporter: 'html',
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  /* Start a preview server for E2E */
  webServer: {
    command: 'npm run preview -- --port 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
  },
});
