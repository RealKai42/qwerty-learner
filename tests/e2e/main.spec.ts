import { test, expect } from '@playwright/test'

test.describe('Main page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')

    await expect(await page.locator('h1').getByText('Qwerty Learner').isVisible()).toBeTruthy()
  })

  // you should run 'yarn update:snapshots' before this test, create base snapshots for visual comparison
  // test('visual comparison', async ({ page }) => {
  //   await page.goto('/');
  //   await expect(page).toHaveScreenshot();
  // });
})
