import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { gunzipSync } from 'node:zlib'

const token = 'frontend-test-token'
const studyItems = [
  { voc_id: 'b', voc_spelling: 'banana', first_response: 'VAGUE', is_new: true, is_finished: true, order: 1 },
  { voc_id: 'a', voc_spelling: 'apple', first_response: 'FORGET', is_new: false, is_finished: true, order: 0 },
  { voc_id: 'pending', voc_spelling: 'cat', is_new: true, is_finished: false, order: 2 },
]
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

async function readBooks(page: Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      return await new Promise<{ id: string; words: { name: string; trans: string[] }[] }[]>((resolve, reject) => {
        const request = database.transaction('customDictionaries').objectStore('customDictionaries').getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } finally {
      database.close()
    }
  })
}

async function configureToken(page: Page) {
  await page.getByRole('button', { name: '墨墨设置', exact: true }).click()
  await page.getByLabel('墨墨 Token', { exact: true }).fill(`Bearer ${token}`)
  await page.getByRole('button', { name: '保存 Token', exact: true }).click()
  await expect(page.getByText('Token 已保存，立即生效。')).toBeVisible()
  await expect(page.getByLabel('墨墨 Token', { exact: true })).toHaveValue('')
  await page.getByTitle('关闭对话框').click()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenEnhancedPromotion', 'true')
    localStorage.setItem('dismissStartCardDate', 'true')
    localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
  })
  await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()))
})

test('backend startup enables import and Token settings', async ({ page }) => {
  await page.goto('/gallery')
  await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
  await expect(page.getByRole('button', { name: '导入今日词汇', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '墨墨设置', exact: true }).click()
  await expect(page.getByRole('tab', { name: '墨墨设置', exact: true })).toHaveAttribute('aria-selected', 'true')
})

test.describe('frontend-only startup', () => {
  test.use({ baseURL: 'http://127.0.0.1:4176' })

  test('directly imports filtered completed words, persists browser Token, and excludes it from backup', async ({ page, request }) => {
    const ownApiRequests: string[] = []
    const upstreamRequests: { path: string; authorization?: string; body: unknown }[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/memo/')) ownApiRequests.push(request.url())
    })
    await page.route('https://open.maimemo.com/open/api/v1/**', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      const path = new URL(route.request().url()).pathname
      upstreamRequests.push({ path, authorization: route.request().headers().authorization, body: route.request().postDataJSON() })
      await route.fulfill({
        headers: cors,
        json: { success: true, data: path.endsWith('get_today_items') ? { today_items: studyItems } : { progress: { finished: 2 } } },
      })
    })
    await page.goto('/gallery')
    await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
    await configureToken(page)
    await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
    await page.getByRole('checkbox', { name: /模糊/ }).uncheck()
    await page.getByRole('button', { name: '导入 1 词', exact: true }).click()
    await expect(page.getByText('已保存 1 词')).toBeVisible()
    expect(upstreamRequests).toHaveLength(2)
    expect(upstreamRequests.every((item) => item.authorization === `Bearer ${token}`)).toBe(true)
    expect(upstreamRequests.find((item) => item.path.endsWith('get_today_items'))?.body).toEqual({ is_finished: true, limit: 1000 })
    const books = await readBooks(page)
    expect(books[0].words.map((word) => word.name)).toEqual(['apple'])
    expect(books[0].words[0].trans.join(' ')).toContain('苹果')
    await page.getByRole('button', { name: '开始练习' }).click()
    await expect(page.getByText(/苹果/).first()).toBeVisible()
    await page.reload()
    await page.getByTitle('打开设置对话框').click()
    await page.getByRole('tab', { name: '墨墨设置', exact: true }).click()
    await expect(page.getByText('已配置墨墨 Token', { exact: true })).toBeVisible()
    await expect(page.getByLabel('墨墨 Token', { exact: true })).toHaveValue('')
    await page.getByRole('tab', { name: '数据设置', exact: true }).click()
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出数据', exact: true }).click()
    const stream = await (await downloadEvent).createReadStream()
    if (!stream) throw new Error('Backup download missing')
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    const backup = gunzipSync(Buffer.concat(chunks)).toString()
    expect(backup).toContain('apple')
    expect(backup).not.toContain(token)
    await page.getByRole('tab', { name: '墨墨设置', exact: true }).click()
    await page.getByRole('button', { name: '清除配置', exact: true }).click()
    await expect(page.getByText('已清除 Token，墨墨导入已停用。')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('maimemo-token'))).toBeNull()
    await page.goto('/gallery')
    await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('尚未配置墨墨账号')
    expect(upstreamRequests).toHaveLength(2)
    expect(await readBooks(page)).toEqual(books)
    expect(ownApiRequests).toEqual([])
    expect((await request.get('/api/memo/settings')).status()).toBe(404)
    expect((await request.post('/api/memo/today')).status()).toBe(404)
  })

  test('direct API authentication and incomplete-result failures preserve the imported book', async ({ page }) => {
    let failure: 'none' | 'auth' | 'incomplete' | 'cap' = 'none'
    await page.route('https://open.maimemo.com/open/api/v1/**', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      if (failure === 'auth') return route.fulfill({ status: 401, headers: cors, json: { error: 'unauthorized' } })
      const items =
        failure === 'cap' ? Array.from({ length: 1000 }, (_, index) => ({ ...studyItems[0], voc_id: String(index) })) : studyItems
      const finished = failure === 'cap' ? 1000 : failure === 'incomplete' ? 3 : 2
      await route.fulfill({
        headers: cors,
        json: {
          success: true,
          data: route.request().url().endsWith('get_today_items') ? { today_items: items } : { progress: { finished } },
        },
      })
    })
    await page.goto('/gallery')
    await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
    await configureToken(page)
    await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
    await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
    await expect(page.getByText('已保存 2 词')).toBeVisible()
    const books = await readBooks(page)
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    failure = 'auth'
    await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('墨墨凭证已过期或无权访问')
    failure = 'incomplete'
    await page.getByRole('button', { name: '重新读取', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('尚未同步完整')
    failure = 'cap'
    await page.getByRole('button', { name: '重新读取', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('1000 词上限')
    expect(await readBooks(page)).toEqual(books)
  })
})
