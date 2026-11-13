import { chromium } from '/home/coder/project/qwerty-learner/node_modules/playwright-core/index.mjs'
const exe = '/home/coder/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/typing.png' })
// click the chapter listbox button (contains 第)
const btns = page.locator('button')
const n = await btns.count()
let clicked = false
for (let i = 0; i < n; i++) {
  const t = await btns.nth(i).textContent()
  if (t && t.includes('第')) { await btns.nth(i).click(); clicked = true; break }
}
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/dropdown.png' })
console.log('clicked chapter btn:', clicked)
await browser.close()
