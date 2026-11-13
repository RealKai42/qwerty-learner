import { chromium } from '/home/coder/project/qwerty-learner/node_modules/playwright-core/index.mjs'
const exe = '/home/coder/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } })
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2500)
const btns = page.locator('button')
const n = await btns.count()
for (let i = 0; i < n; i++) {
  const t = (await btns.nth(i).textContent()) || ''
  if (t.includes('Chapter')) { await btns.nth(i).click(); break }
}
await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[role=listbox]')]
  return els.map(el => {
    const cs = getComputedStyle(el)
    const li = el.querySelector('li')
    const csLi = li ? getComputedStyle(li) : null
    const r = el.getBoundingClientRect()
    return { cls: el.className.slice(0, 50), hidden: el.hidden, bg: cs.backgroundColor, display: cs.display,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      liPos: csLi?.position, liDisplay: csLi?.display, liCount: el.children.length }
  })
})
console.log(JSON.stringify(info, null, 1))
await page.screenshot({ path: '/tmp/dropdown2.png' })
await browser.close()
