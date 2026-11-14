import { test, expect } from './fixtures'

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Activity heatmaps in ${colorScheme} mode`, () => {
    test.use({ colorScheme })

    test("hover shows each calendar's date and count, including zero days", async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const { date, zeroDate } = await page.evaluate(async () => {
        const { db } = await import('/src/utils/db/index.ts')
        const day = new Date()
        day.setDate(day.getDate() - 2)
        day.setHours(12, 0, 0, 0)
        const timeStamp = Math.floor(day.getTime() / 1000)
        await db.wordRecords.bulkAdd(
          ['cancel', 'cancel', 'remote'].map((word) => ({
            word,
            dict: 'cet4',
            chapter: 0,
            timeStamp,
            timing: [100, 200],
            wrongCount: 1,
            mistakes: { 0: ['a'] },
          })),
        )
        const format = (date: Date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const date = format(day)
        day.setDate(day.getDate() + 1)
        return { date, zeroDate: format(day) }
      })
      await page.goto('/analysis')
      const activity = page.locator(`rect[data-date="${date}"]`)
      await activity.first().hover()
      await expect(page.getByRole('tooltip')).toHaveText(`${date} 练习 3 次`)
      await expect(page.getByRole('tooltip')).toHaveAttribute('data-color-scheme', colorScheme)
      await page.screenshot({ path: `/private/tmp/qwerty-heatmap-${colorScheme}-${test.info().project.name}.png` })
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
