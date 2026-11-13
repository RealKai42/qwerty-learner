import { test, expect } from './fixtures'

test.describe('Theme switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Has theme switch button', async ({ page }) => {
    await expect(page.getByLabel('开关深色模式')).toBeVisible()
  })

  test('Theme mode switch', async ({ page }) => {
    // light to dark
    await page.getByLabel('开关深色模式').click()
    await expect(page.locator('html')).toHaveClass('dark')

    await page.waitForTimeout(500)

    // dark to light
    await page.getByLabel('开关深色模式').click()
    await expect(page.locator('html')).toHaveClass('')
  })
})
