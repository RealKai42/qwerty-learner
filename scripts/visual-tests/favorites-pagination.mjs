import { chromium } from '/home/coder/project/qwerty-learner/node_modules/playwright-core/index.mjs'
const exe = '/home/coder/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } })
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2500)
// seed favorites via app's dexie (RecordDB v4)
await page.evaluate(async () => {
  const records = Array.from({ length: 35 }, (_, i) => ({ word: `word${i + 1}`, dict: 'cet4', chapter: 0, timeStamp: 1700000000 + i }))
  const db = await new Promise((res, rej) => {
    const rq = indexedDB.open('RecordDB')
    rq.onsuccess = () => res(rq.result)
    rq.onerror = () => rej(rq.error)
  })
  await new Promise((res, rej) => {
    const tx = db.transaction('favoriteRecords', 'readwrite')
    const st = tx.objectStore('favoriteRecords')
    records.forEach((r) => st.add(r))
    tx.oncomplete = res
    tx.onerror = () => rej(tx.error)
  })
  db.close()
})
await page.goto('http://localhost:5173/favorites', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/favorites.png' })
// open page-size dropdown (bottom row select button showing 20)
const btns = page.locator('button')
const n = await btns.count()
for (let i = n - 1; i >= 0; i--) {
  const t = (await btns.nth(i).textContent()) || ''
  if (t.trim() === '20') { await btns.nth(i).click(); break }
}
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fav-dropdown.png' })
const scrollH = await page.evaluate(() => `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight} vs viewport ${window.innerWidth}x${window.innerHeight}`)
console.log('scroll:', scrollH)
await browser.close()
