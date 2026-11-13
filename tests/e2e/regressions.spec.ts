import { test, expect } from './fixtures'

test('error book opens without a render failure', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/error-book')
  await expect(page.getByText('Tip: 点击错误单词查看详细信息')).toBeVisible()
  await expect(page.getByText('错误次数', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('typing in settings keeps the first character and leaves practice paused', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  const url = dialog.getByPlaceholder('https://nas.local/webdav/')
  await url.pressSequentially('https://example.invalid/dav')
  await expect(url).toHaveValue('https://example.invalid/dav')
  await url.press('Enter')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeAttached()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  await page.keyboard.press('a')
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
})

test('a removed favorite stays hidden after reloading the favorites page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
  // The current word's star is the final star button after adjacent-word controls.
  await page.getByRole('button', { name: '收藏/取消收藏', exact: true }).last().click()
  await page.getByRole('button', { name: '查看收藏夹', exact: true }).click()
  await expect(page.getByText('cancel', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '取消收藏', exact: true }).click()
  await expect(page.getByText('还没有收藏任何单词')).toBeVisible()
  await page.reload()
  await expect(page.getByText('还没有收藏任何单词')).toBeVisible()
})
