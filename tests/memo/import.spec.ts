import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { gunzipSync } from 'node:zlib'

type StoredBook = {
  id: string
  words: { name: string }[]
  wordArchive: { name: string }[]
  wordListRevision: number
  responseTypes: string[]
}

function snapshot() {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(Date.now() - 4 * 60 * 60 * 1000),
  )
  return {
    date,
    fetchedAt: new Date().toISOString(),
    completed: 4,
    items: [
      { vocId: 'a', response: 'FORGET', isNew: false, word: { name: 'apple', trans: ['苹果'], usphone: 'æpl', ukphone: 'æpl' } },
      { vocId: 'b', response: 'VAGUE', isNew: true, word: { name: 'banana', trans: ['香蕉'], usphone: 'bəˈnænə', ukphone: 'bəˈnɑːnə' } },
      { vocId: 'c', response: 'FAMILIAR', isNew: false, word: { name: 'cat', trans: ['猫'], usphone: 'kæt', ukphone: 'kæt' } },
      { vocId: 'd', response: 'WELL_FAMILIAR', isNew: false, word: { name: 'dog', trans: ['狗'], usphone: 'dɒɡ', ukphone: 'dɒɡ' } },
    ],
  }
}

async function openImport(page: Page) {
  await page.goto('/gallery')
  await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await expect(page.getByText('选择词汇类型（可多选）')).toBeVisible()
}

async function readDictionary(page: Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      return await new Promise<StoredBook>((resolve, reject) => {
        const request = database.transaction('customDictionaries').objectStore('customDictionaries').getAll()
        request.onsuccess = () => resolve(request.result[0])
        request.onerror = () => reject(request.error)
      })
    } finally {
      database.close()
    }
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenEnhancedPromotion', 'true')
    localStorage.setItem('dismissStartCardDate', JSON.stringify(new Date().toISOString()))
    localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
  })
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort()
    return route.continue()
  })
  await page.route('**/api/memo/today', (route) => route.fulfill({ json: snapshot() }))
})

test('type selection imports a daily wordbook that survives reload and enters practice', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openImport(page)
  await page.getByRole('checkbox', { name: /记忆（认识）/ }).uncheck()
  await page.getByRole('checkbox', { name: /熟知/ }).uncheck()
  await expect(page.getByText('将导入 2 词，其中新词 1 个、复习词 1 个。')).toBeVisible()
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await expect(page.getByText('已保存 2 词')).toBeVisible()
  await page.getByRole('button', { name: '开始练习' }).click()
  await expect(page.getByRole('link', { name: /今日词汇/ })).toBeVisible()
  await expect(page.getByText('苹果', { exact: true })).toBeVisible()
  await page.keyboard.press('Enter')
  await page.keyboard.type('apple')
  await expect(page.getByText('香蕉', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: /今日词汇/ })).toBeVisible()
  const book = await readDictionary(page)
  expect(book.words.map((word: { name: string }) => word.name)).toEqual(['apple', 'banana'])
  expect(book.responseTypes).toEqual(['FORGET', 'VAGUE'])
  expect(errors).toEqual([])
})

test('changing same-day filters replaces the list and retains archived error definitions', async ({ page }) => {
  await openImport(page)
  await page.getByRole('button', { name: '导入 4 词', exact: true }).click()
  await expect(page.getByText('已保存 4 词')).toBeVisible()
  const original = await readDictionary(page)
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.evaluate(async (dict) => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('wordRecords', 'readwrite')
      transaction
        .objectStore('wordRecords')
        .add({ dict, word: 'cat', chapter: 0, wrongCount: 1, timeStamp: Math.floor(Date.now() / 1000), timing: [10], mistakes: {} })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  }, original.id)
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await page.getByRole('checkbox', { name: /记忆（认识）/ }).uncheck()
  await page.getByRole('checkbox', { name: /熟知/ }).uncheck()
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await expect(page.getByText('已保存 2 词')).toBeVisible()
  const updated = await readDictionary(page)
  expect(updated.id).toBe(original.id)
  expect(updated.words.map((word: { name: string }) => word.name)).toEqual(['apple', 'banana'])
  expect(updated.wordArchive).toHaveLength(4)
  expect(updated.wordListRevision).not.toBe(original.wordListRevision)
  await page.goto('/error-book')
  await expect(page.getByText('猫', { exact: true })).toBeVisible()
  await expect(page.getByText(/今日词汇/)).toBeVisible()
})

test('empty selection, empty results, and API errors do not replace an existing book', async ({ page }) => {
  await openImport(page)
  await page.getByRole('button', { name: '导入 4 词', exact: true }).click()
  await expect(page.getByText('已保存 4 词')).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await expect(page.getByText('选择词汇类型（可多选）')).toBeVisible()
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.uncheck()
  await expect(page.getByRole('button', { name: '导入 0 词', exact: true })).toBeDisabled()
  await page.route('**/api/memo/today', (route) => route.fulfill({ json: { ...snapshot(), completed: 0, items: [] } }))
  await page.getByRole('button', { name: '重新读取' }).click()
  await expect(page.getByText(/今天尚无已完成的词汇/)).toBeVisible()
  expect((await readDictionary(page)).words).toHaveLength(4)
  await page.route('**/api/memo/today', (route) => route.fulfill({ status: 503, json: { error: '模拟服务不可用' } }))
  await page.getByRole('button', { name: '重新读取' }).click()
  await expect(page.getByRole('alert')).toHaveText('模拟服务不可用')
  expect((await readDictionary(page)).words).toHaveLength(4)
})

test('keyboard import stays in the gallery and unknown feedback is selectable', async ({ page }) => {
  const data = snapshot()
  data.items[0].response = 'CANCEL_WELL_FAMILIAR'
  await page.route('**/api/memo/today', (route) => route.fulfill({ json: data }))
  await openImport(page)
  await expect(page.getByRole('checkbox', { name: /其他反馈/ })).toBeChecked()
  const button = page.getByRole('button', { name: '导入 4 词', exact: true })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('已保存 4 词')).toBeVisible()
  await expect(page).toHaveURL(/gallery$/)
})

test('existing version 3 study data survives the database upgrade', async ({ page }) => {
  await page.route('**/migration-setup', (route) => route.fulfill({ contentType: 'text/html', body: '<html></html>' }))
  await page.goto('/migration-setup')
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      // Dexie schema version 3 uses native IndexedDB version 30.
      const request = indexedDB.open('RecordDB', 30)
      request.onupgradeneeded = () => {
        const words = request.result.createObjectStore('wordRecords', { keyPath: 'id', autoIncrement: true })
        for (const key of ['word', 'timeStamp', 'dict', 'chapter', 'wrongCount']) words.createIndex(key, key)
        words.createIndex('[dict+chapter]', ['dict', 'chapter'])
        const chapters = request.result.createObjectStore('chapterRecords', { keyPath: 'id', autoIncrement: true })
        for (const key of ['timeStamp', 'dict', 'chapter', 'time']) chapters.createIndex(key, key)
        chapters.createIndex('[dict+chapter]', ['dict', 'chapter'])
        const reviews = request.result.createObjectStore('reviewRecords', { keyPath: 'id', autoIncrement: true })
        for (const key of ['dict', 'createTime', 'isFinished']) reviews.createIndex(key, key)
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('wordRecords', 'readwrite')
      transaction
        .objectStore('wordRecords')
        .add({ dict: 'cet4', word: 'cancel', chapter: 0, wrongCount: 1, timeStamp: 1, timing: [10], mistakes: {} })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  })
  await openImport(page)
  await page.getByRole('button', { name: '导入 4 词', exact: true }).click()
  await expect(page.getByText('已保存 4 词')).toBeVisible()
  await page.goto('/error-book')
  await expect(page.getByText('cancel', { exact: true })).toBeVisible()
  await expect(page.getByText('CET-4', { exact: true })).toBeVisible()
})

test('daily wordbooks round-trip through the existing data backup UI', async ({ page, browser }) => {
  await openImport(page)
  await page.getByRole('button', { name: '导入 4 词', exact: true }).click()
  await page.getByRole('button', { name: '开始练习' }).click()
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '数据设置' }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出数据', exact: true }).click()
  const download = await downloaded
  const stream = await download.createReadStream()
  if (!stream) throw new Error('未能读取备份文件。')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const buffer = Buffer.concat(chunks)
  const json = gunzipSync(buffer).toString()
  expect(json).toContain('customDictionaries')
  expect(json).toContain('今日词汇')
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4174' })
  try {
    const restored = await context.newPage()
    await restored.addInitScript(() => {
      localStorage.setItem('hasSeenEnhancedPromotion', 'true')
      localStorage.setItem('dismissStartCardDate', 'true')
    })
    await restored.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()))
    await restored.goto('/')
    await restored.getByTitle('打开设置对话框').click()
    await restored.getByRole('tab', { name: '数据设置' }).click()
    const fileChooser = restored.waitForEvent('filechooser')
    await restored.getByRole('button', { name: '导入数据', exact: true }).click()
    await (await fileChooser).setFiles({ name: download.suggestedFilename(), mimeType: 'application/gzip', buffer })
    await expect.poll(async () => (await readDictionary(restored))?.words.length).toBe(4)
    await restored.goto('/gallery')
    await restored.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
    await expect(restored.getByRole('button', { name: /今日词汇/ }).first()).toBeVisible()
  } finally {
    await context.close()
  }
})
