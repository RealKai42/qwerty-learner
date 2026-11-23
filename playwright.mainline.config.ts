import { defineConfig, devices } from '@playwright/test'

/**
 * The mainline check runs against a production build.
 * The dev server double-invokes effects, which would play a word twice.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'mainline.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  outputDir: 'test-results/mainline',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/mainline' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    colorScheme: 'light',
    ...devices['Desktop Chrome'],
    // The Chromium pinned by Playwright 1.40 does not launch on this macOS.
    // CI uses that Chromium on Ubuntu. Local runs use the installed Chrome.
    ...(process.env.CI ? {} : { channel: 'chrome' as const }),
  },
  webServer: {
    command: 'yarn build && yarn vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
