import { test, expect } from '@playwright/test'

test.describe('Dictionary manage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('关闭提示').click()

    await expect(await page.getByText('CET-4').isVisible()).toBeTruthy()

    await page.getByText('CET-4').hover()
    await expect(await page.getByText('词典切换').isVisible()).toBeTruthy()

    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')
  })

  test('Switch language', async ({ page }) => {
    await expect(await page.getByRole('radio', { name: /^英语$/ }).getAttribute('aria-checked')).toBeTruthy()

    await page.getByRole('radio', { name: /^日语$/ }).click()
    await expect(await page.getByRole('radio', { name: /^日语$/ }).getAttribute('aria-checked')).toBeTruthy()
    await expect(
      await page
        .getByRole('button', { name: /日语常见词/g })
        .first()
        .isVisible(),
    ).toBeTruthy()

    await page.getByRole('radio', { name: /^Code$/ }).click()
    await expect(await page.getByRole('radio', { name: /^Code$/ }).getAttribute('aria-checked')).toBeTruthy()
    await expect(
      await page
        .getByRole('button', { name: /Coder Dict/g })
        .first()
        .isVisible(),
    ).toBeTruthy()
  })

  test('Switch category', async ({ page }) => {
    await expect(await page.getByRole('radio', { name: /^大学英语$/ }).getAttribute('aria-checked')).toBeTruthy()

    await page.getByRole('radio', { name: /^考研$/ }).click()
    await expect(await page.getByRole('radio', { name: /^考研$/ }).getAttribute('aria-checked')).toBeTruthy()
    await expect(await page.getByRole('button', { name: /考研/g }).first().isVisible()).toBeTruthy()

    await page.getByRole('radio', { name: /^GRE$/ }).click()
    await expect(await page.getByRole('radio', { name: /^GRE$/ }).getAttribute('aria-checked')).toBeTruthy()
    await expect(await page.getByRole('button', { name: /GRE/g }).first().isVisible()).toBeTruthy()
  })

  test.only('Switch dictionary', async ({ page }) => {
    await page
      .getByRole('button', { name: /六级巧记速记/g })
      .first()
      .click()
    await page.getByRole('heading', { name: '第 2 章' }).click()

    await page.waitForURL('**/')
    await expect(await page.getByRole('button', { name: '第 2 章' }).first().isVisible()).toBeTruthy()
  })

  test('Switch dictionary chapter', async ({ page }) => {
    await page.getByRole('button', { name: /CET-4/g }).first().click()
    await page.getByRole('cell', { name: '2', exact: true }).click()
    await page.getByText('确定').first().click()

    await page.waitForURL('**/')
    await expect(await page.getByText('CET-4 第 2 章').isVisible()).toBeTruthy()
  })

  test('Close dictionary settings', async ({ page }) => {
    // should use testId
    await page.locator('main > div > svg').first().click()

    await page.waitForURL('**/')
    await expect(await page.getByText('CET-4 第 1 章').isVisible()).toBeTruthy()
  })
})
