import { test, expect } from './fixtures'

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Activity heatmaps in ${colorScheme} mode`, () => {
    test.use({ colorScheme })

    for (const entry of ['page', 'dialog'] as const) {
      test.describe(entry, () => {
        test("hover shows each calendar's date and count, including zero days", async ({ page }) => {
          await page.goto('/')
          await page.waitForLoadState('networkidle')
          const { date, zeroDate } = await page.evaluate(async () => {
            const day = new Date()
            day.setDate(day.getDate() - 2)
            day.setHours(12, 0, 0, 0)
            const timeStamp = Math.floor(day.getTime() / 1000)
            await new Promise<void>((resolve, reject) => {
              const request = indexedDB.open('RecordDB')
              request.onerror = () => reject(request.error)
              request.onsuccess = () => {
                const db = request.result
                const transaction = db.transaction('wordRecords', 'readwrite')
                for (const word of ['cancel', 'cancel', 'remote']) {
                  transaction.objectStore('wordRecords').add({
                    word,
                    dict: 'cet4',
                    chapter: 0,
                    timeStamp,
                    timing: [100, 200],
                    wrongCount: 1,
                    mistakes: { 0: ['a'] },
                  })
                }
                transaction.oncomplete = () => {
                  db.close()
                  resolve()
                }
                transaction.onerror = () => {
                  db.close()
                  reject(transaction.error)
                }
              }
            })
            const format = (date: Date) =>
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            const date = format(day)
            day.setDate(day.getDate() + 1)
            return { date, zeroDate: format(day) }
          })
          if (entry === 'page') {
            await page.goto('/analysis')
          } else {
            await page.reload()
            await page.getByRole('button', { name: '查看数据统计', exact: true }).click()
            await page
              .getByRole('dialog')
              .evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished)))
          }
          const activity = page.locator(`rect[data-date="${date}"]`)
          await activity.first().hover()
          await expect(page.getByRole('tooltip')).toHaveText(`${date} 练习 3 次`)
          await expect(page.getByRole('tooltip')).toHaveAttribute('data-color-scheme', colorScheme)
          // Visibility alone passes when the dialog paints over the body portal.
          await expect
            .poll(() =>
              page.getByRole('tooltip').evaluate((el) => {
                const previous = el.style.pointerEvents
                try {
                  el.style.pointerEvents = 'auto'
                  const rect = el.getBoundingClientRect()
                  const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
                  return top !== null && el.contains(top)
                } finally {
                  el.style.pointerEvents = previous
                }
              }),
            )
            .toBe(true)
          await page.screenshot({ path: `/private/tmp/qwerty-heatmap-${entry}-${colorScheme}-${test.info().project.name}.png` })
          await expect(page.getByText('过去一年总计 3 次', { exact: true })).toBeVisible()

          await activity.nth(1).hover()
          await expect(page.getByRole('tooltip', { name: `${date} 练习 2 次`, exact: true })).toBeVisible()
          await expect(page.getByRole('tooltip')).toHaveCount(1)
          await expect(page.getByText('过去一年总计 2 次', { exact: true })).toBeVisible()

          await page.locator(`rect[data-date="${zeroDate}"]`).nth(1).hover()
          await expect(page.getByRole('tooltip', { name: `${zeroDate} 练习 0 次`, exact: true })).toBeVisible()
          await expect(page.getByRole('tooltip')).toHaveCount(1)
        })
      })
    }
  })
}
