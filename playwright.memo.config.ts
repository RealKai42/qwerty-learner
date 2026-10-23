import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

export default defineConfig({
  testDir: './tests/memo',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    },
  },
  webServer: [
    {
      command: 'npm run dev -- --backend --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
      env: { memo_token: '', MAIMEMO_TOKEN: '' },
    },
    {
      command: 'npm run dev -- --no-backend --host 127.0.0.1 --port 4176 --strictPort',
      url: 'http://127.0.0.1:4176',
      reuseExistingServer: false,
      env: { memo_token: '', MAIMEMO_TOKEN: '' },
    },
  ],
})
