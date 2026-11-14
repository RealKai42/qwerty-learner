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
  await expect(url).toBeEnabled()
  await url.pressSequentially('https://example.invalid/dav')
  await expect(url).toHaveValue('https://example.invalid/dav')
  await url.press('Enter')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeAttached()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  await page.keyboard.press('a')
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
})

test('WebDAV edits only take effect after saving the config', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  const username = dialog.locator('input[type="text"]').nth(1)
  await expect(username).toBeEnabled()
  await username.fill('unsaved-draft')
  await expect(dialog.getByRole('button', { name: '保存配置', exact: true })).toBeEnabled()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  await expect(username).toHaveValue('')
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

test('WebDAV credentials accept typing and editing while practice stays paused', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  const username = dialog.locator('input[type="text"]').nth(1)
  const password = dialog.locator('input[type="password"]')
  await username.click()
  await username.pressSequentially('alice')
  await expect(username).toHaveValue('alice')
  await username.press('Space')
  await username.pressSequentially('test')
  await expect(username).toHaveValue('alice test')
  await username.press('Backspace')
  await expect(username).toHaveValue('alice tes')
  await password.click()
  await password.pressSequentially('aB12!@#')
  await expect(password).toHaveValue('aB12!@#')
  await password.press('Backspace')
  await expect(password).toHaveValue('aB12!@')
  await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(dialog.getByText('配置已保存', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '开始', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  await expect(username).toHaveValue('alice tes')
  await expect(password).toHaveValue('aB12!@')
})

test('WebDAV settings persist in IndexedDB when localStorage writes are blocked', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('other-app-data', 'preserve-me')
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && (key === 'webdavConfig' || key === 'webdavCredentials')) {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  const username = dialog.locator('input[type="text"]').nth(1)
  const password = dialog.locator('input[type="password"]')
  await username.pressSequentially('qwer-learning')
  await expect(username).toHaveValue('qwer-learning')
  await password.pressSequentially('test-Password!')
  await expect(password).toHaveValue('test-Password!')
  await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
  await expect(dialog.getByText('配置已保存', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.reload()
  await page.getByRole('button', { name: '打开设置对话框' }).click()
  await dialog.getByRole('tab', { name: '备份', exact: true }).click()
  await expect(username).toHaveValue('qwer-learning')
  await expect(password).toHaveValue('test-Password!')
  expect(await page.evaluate(() => localStorage.getItem('other-app-data'))).toBe('preserve-me')
  expect(
    await page.evaluate(() => [
      localStorage.getItem('webdavConfig'),
      localStorage.getItem('webdavCredentials'),
      sessionStorage.getItem('qwerty-setting:webdavCredentials'),
    ]),
  ).toEqual([null, null, null])
})
