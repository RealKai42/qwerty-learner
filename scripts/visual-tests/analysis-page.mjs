import { chromium } from '/home/coder/project/qwerty-learner/node_modules/playwright-core/index.mjs'
const exe = '/home/coder/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } })
await page.goto('http://localhost:5173/analysis', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(3000)
await page.screenshot({ path: '/tmp/analysis.png' })
await browser.close()
console.log('ok')
