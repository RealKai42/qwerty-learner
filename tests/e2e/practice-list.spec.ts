import { test, expect } from './fixtures'

test.describe('Practice List', () => {
  test.beforeEach(async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.getByRole('button', { name: 'CET-4 第 1 章', exact: true }).click()
  })

  test('Practice list button click to open the list ', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'CET-4 第 1 章' })).toBeVisible()
    // should use testId
    await page.locator('#headlessui-portal-root').locator('div > p', { hasText: 'cancel' }).click()
  })

  test('Close practice list', async ({ page }) => {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: 'CET-4 第 1 章' })).toBeHidden()
  })
})
