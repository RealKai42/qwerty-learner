import { test, expect } from './fixtures'

test.describe('Dictionary manage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Homepage default dictionary', async ({ page }) => {
    await expect(page.getByText('CET-4')).toBeVisible()

    await page.getByText('CET-4').hover()
    await expect(page.getByText('词典切换')).toBeVisible()
  })

  test('Switch language', async ({ page }) => {
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')

    await expect(page.getByRole('radio', { name: /^英语$/ })).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('radio', { name: /^日语$/ }).click()
    await expect(page.getByRole('radio', { name: /^日语$/ })).toHaveAttribute('aria-checked', 'true')
    await expect(
      await page
        .getByRole('button', { name: /日语常见词/g })
        .first()
        .isVisible(),
    ).toBeTruthy()

    await page.getByRole('radio', { name: /^Code$/ }).click()
    await expect(page.getByRole('radio', { name: /^Code$/ })).toHaveAttribute('aria-checked', 'true')
    await expect(
      await page
        .getByRole('button', { name: /Coder Dict/g })
        .first()
        .isVisible(),
    ).toBeTruthy()
  })

  test('Switch category', async ({ page }) => {
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')

    await expect(page.getByRole('radio', { name: /^大学英语$/ })).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('radio', { name: /^考研$/ }).click()
    await expect(page.getByRole('radio', { name: /^考研$/ })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('button', { name: /考研/g }).first()).toBeVisible()

    await page.getByRole('radio', { name: /^GRE$/ }).click()
    await expect(page.getByRole('radio', { name: /^GRE$/ })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('button', { name: /GRE/g }).first()).toBeVisible()
  })

  test('Switch dictionary', async ({ page }) => {
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')

    await page
      .getByRole('button', { name: /六级巧记速记/g })
      .first()
      .click()
    await page.getByRole('heading', { name: '第 2 章' }).click()

    await page.waitForURL('**/')
    await expect(page.getByRole('button', { name: '第 2 章' }).first()).toBeVisible()
  })

  test('Close dictionary settings', async ({ page }) => {
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')
    // should use testId
    await page.locator('main > div > svg').first().click()

    await page.waitForURL('**/')
    await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  })

  test('Switch dictionary chapter', async ({ page }) => {
    await page.getByText('第 1 章').first().hover()
    await expect(page.getByText('章节切换')).toBeVisible()

    await page.getByText('第 1 章').click()
    await page.getByRole('option', { name: '第 2 章' }).click()

    await page.getByText('第 2 章').first().hover()
    await expect(page.getByText('章节切换')).toBeVisible()
  })
})
