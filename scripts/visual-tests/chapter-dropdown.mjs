import { chromium } from '/home/coder/project/qwerty-learner/node_modules/playwright-core/index.mjs'
const exe = '/home/coder/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
const btns = page.locator('button')
const n = await btns.count()
for (let i = 0; i < n; i++) {
  const t = (await btns.nth(i).textContent()) || ''
  if (t.includes('Chapter')) { await btns.nth(i).click(); break }
}
await page.waitForTimeout(700)
await page.screenshot({ path: '/tmp/dropdown.png' })
// also open sound switcher (speaker icon in nav) - click 2nd icon button
const icons = page.locator('nav button')
console.log('nav buttons:', await icons.count())
const html = await page.locator('ul[role=listbox], [role=listbox]').first().boundingBox().catch(()=>null)
console.log('listbox box:', html)
await browser.close()
