import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const pressWord = async (page: Page, word: string) => {
  const letters = word.split('')
  for (const letter of letters) {
    await page.keyboard.press(letter)
  }
}

const pressWords = async (page: Page, words: string[]) => {
  for (const word of words) {
    await pressWord(page, word)
    await page.waitForTimeout(300)
  }
}

test.describe('Practice', () => {
  test.beforeEach(async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  })

  test('Press any key to start', async ({ page }) => {
    await expect(page.getByText('按任意键开始')).toBeVisible()

    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await expect(page.locator('p').getByText('按任意键开始')).toBeHidden()
  })

  test('Enter the correct word', async ({ page }) => {
    await page.keyboard.press('Enter')

    await pressWord(page, 'cancel')

    await expect(page.getByText('正确率', { exact: true }).locator('..').locator('span').first()).toHaveText('100')

    // auto show next word: explosive
    await expect(page.locator('span', { hasText: /^e$/ }).first()).toBeVisible()
    await expect(page.locator('span', { hasText: /^x$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^p$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^l$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^o$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^s$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^i$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^v$/ })).toBeVisible()
    await expect(page.locator('span', { hasText: /^e$/ }).last()).toBeVisible()
  })

  test('Enter the wrong word', async ({ page }) => {
    await page.keyboard.press('Enter')

    await pressWord(page, 'canca')

    await expect(page.getByText('输入数', { exact: true }).locator('..').locator('span').first()).toHaveText('5')
    await expect(page.getByText('正确数', { exact: true }).locator('..').locator('span').first()).toHaveText('4')
    await page.waitForTimeout(500)
    await expect(page.getByText('正确率', { exact: true }).locator('..').locator('span').first()).toHaveText('80')
  })

  test('Enter the correct letter, should show green color', async ({ page }) => {
    await page.keyboard.press('Enter')

    await page.keyboard.press('c')
    await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-green-600/)

    await page.keyboard.press('a')
    await expect(page.locator('span', { hasText: /^a$/ })).toHaveClass(/text-green-600/)

    await page.keyboard.press('n')
    await expect(page.locator('span', { hasText: /^n$/ })).toHaveClass(/text-green-600/)
  })

  test('Enter the wrong letter, should show red color', async ({ page }) => {
    await page.keyboard.press('Enter')
    await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-gray-600/)

    await page.keyboard.press('a')
    await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-red-600/)

    await page.waitForTimeout(500)
    await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-gray-600/)
  })

  test('Complete the exercises for 1 chapter, enter the next chapter', async ({ page }) => {
    await page.keyboard.press('Enter')

    const chapter1 = [
      'cancel',
      'explosive',
      'numerous',
      'govern',
      'analyse',
      'discourage',
      'resemble',
      'remote',
      'salary',
      'pollution',
      'pretend',
      'kettle',
      'wreck',
      'drunk',
      'calculate',
      'persistent',
      'sake',
      'conceal',
      'audience',
      'meanwhile',
    ]

    await pressWords(page, chapter1)

    await expect(page.getByText('100%', { exact: true })).toBeVisible()
    await expect(page.getByText('表现不错！全对了！')).toBeVisible()

    await page.getByRole('button', { name: '下一章节' }).click()

    await expect(page.getByRole('button', { name: '第 2 章', exact: true })).toBeVisible()
  })
})
