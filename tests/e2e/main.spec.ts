import { test, expect } from './fixtures'

test.describe('Main page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1').getByText('Qwerty Learner')).toBeVisible()
  })

  // you should run 'yarn update:snapshots' before this test, create base snapshots for visual comparison
  // test('visual comparison', async ({ page }) => {
  //   await page.goto('/');
  //   await expect(page).toHaveScreenshot();
  // });
})
