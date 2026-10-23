import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

type Word = { name: string; trans: string[]; usphone: string; ukphone: string }
type Book = { id: string; name: string; words: Word[]; wordArchive: Word[]; updatedAt: number; historySources?: Record<string, unknown> }
type StudyRecord = { id: number; dict: string; originalDict?: string; [key: string]: unknown }

const word = (name: string, ...trans: string[]): Word => ({ name, trans, usphone: '', ukphone: '' })
const todayItems = [
  { vocId: 'a', response: 'FORGET', isNew: false, word: word('apple', '苹果') },
  { vocId: 'b', response: 'VAGUE', isNew: true, word: word('banana', '香蕉') },
]

function studyDay(offsetDays = 0) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(Date.now() - 4 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000),
  )
}

async function readData(page: Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('RecordDB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const read = (table: string) =>
      new Promise<unknown[]>((resolve, reject) => {
        const request = database.transaction(table).objectStore(table).getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    try {
      return {
        books: (await read('customDictionaries')) as Book[],
        words: (await read('wordRecords')) as StudyRecord[],
        chapters: (await read('chapterRecords')) as StudyRecord[],
        reviews: (await read('reviewRecords')) as StudyRecord[],
      }
    } finally {
      database.close()
    }
  })
}

async function openMemo(page: Page) {
  await page.goto('/gallery')
  await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
}

async function installStudyClock(page: Page) {
  await page.addInitScript(() => {
    const NativeDate = Date
    let timestamp = NativeDate.parse('2026-10-22T19:59:59.000Z')
    const controlled = window as Window & { setStudyClock: (value: string) => void }
    controlled.setStudyClock = (value) => {
      timestamp = NativeDate.parse(value)
    }
    window.Date = new Proxy(NativeDate, {
      construct: (target, args) => Reflect.construct(target, args.length ? args : [timestamp]),
      get: (target, key) => (key === 'now' ? () => timestamp : Reflect.get(target, key)),
    })
  })
  await page.route('**/api/memo/today', (route) =>
    route.fulfill({
      json: {
        date: '2026-10-22',
        fetchedAt: '2026-10-22T19:59:59Z',
        completed: 2,
        items: todayItems,
      },
    }),
  )
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenEnhancedPromotion', 'true')
    localStorage.setItem('dismissStartCardDate', 'true')
    localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
  })
  await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()))
  await page.route('**/api/memo/today', (route) =>
    route.fulfill({
      json: {
        date: studyDay(),
        fetchedAt: new Date().toISOString(),
        completed: 2,
        items: todayItems,
      },
    }),
  )
  await page.route('**/api/memo/settings', (route) => route.fulfill({ json: { configured: false, source: 'none' } }))
})

test('Memo is a peer menu and its import action appears only in that menu', async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByRole('radio', { name: '英语', exact: true })).toBeChecked()
  await expect(page.getByRole('button', { name: '导入今日词汇', exact: true })).toHaveCount(0)
  await page.getByRole('radio', { name: '墨墨每日词汇', exact: true }).click()
  await expect(page.getByRole('button', { name: '导入今日词汇', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '墨墨设置', exact: true }).click()
  await expect(page.getByRole('tab', { name: '墨墨设置', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.getByTitle('关闭对话框').click()
  await page.getByRole('radio', { name: '日语', exact: true }).click()
  await expect(page.getByRole('button', { name: '导入今日词汇', exact: true })).toHaveCount(0)
})

test('development server never exposes private Token configuration files', async ({ request }) => {
  for (const pathname of ['/.memo-settings.json', '/%2Ememo-settings.json?raw', '/.memo-settings.example.tmp']) {
    expect((await request.get(pathname)).status()).toBe(403)
  }
})

test('existing daily books stay unchanged until import, then merge and preserve every study record', async ({ page }) => {
  const oldest = studyDay(-2),
    yesterday = studyDay(-1),
    today = studyDay()
  const olderId = `maimemo-${oldest}`,
    recentId = `maimemo-${yesterday}`,
    todayId = `maimemo-${today}`
  const book = (date: string, revision: number, words: Word[], archive = words) => ({
    id: `maimemo-${date}`,
    name: `墨墨每日词汇 · ${date}`,
    description: '已完成',
    source: 'maimemo',
    studyDate: date,
    updatedAt: revision,
    wordListRevision: revision,
    responseTypes: ['FORGET'],
    category: '个人词书',
    tags: ['墨墨每日词汇'],
    url: `custom-dictionary://maimemo-${date}?revision=${revision}`,
    length: words.length,
    chapterCount: 1,
    language: 'en',
    languageCategory: 'en',
    words,
    wordArchive: archive,
  })
  const books = [
    book(oldest, 100, [word(' Apple ', '苹果公司', ' 苹果 '), word('cherry', '樱桃')]),
    book(yesterday, 200, [word('apple', '苹果'), word('banana', '香蕉')], [word('apple', '苹果'), word('retired', '旧词')]),
    book(today, 300, [word('today', '今天')]),
  ]
  const words = [
    { id: 11, dict: olderId, word: ' Apple ', timeStamp: 10, chapter: 0, wrongCount: 2, timing: [100, 200], mistakes: { 0: ['x'] } },
    { id: 12, dict: recentId, word: 'apple', timeStamp: 20, chapter: 0, wrongCount: 3, timing: [300], mistakes: {} },
    { id: 13, dict: recentId, word: 'retired', timeStamp: 30, chapter: 0, wrongCount: 1, timing: [400], mistakes: {} },
    { id: 14, dict: todayId, word: 'today', timeStamp: 40, chapter: 0, wrongCount: 0, timing: [500], mistakes: {} },
  ]
  const chapters = [
    {
      id: 21,
      dict: olderId,
      chapter: 0,
      dictionaryRevision: 100,
      timeStamp: 10,
      time: 12,
      correctCount: 3,
      wrongCount: 1,
      wordCount: 2,
      wordNumber: 2,
      correctWordIndexes: [1],
      wordRecordIds: [11],
    },
  ]
  const reviews = [
    {
      id: 31,
      dict: recentId,
      index: 1,
      createTime: 11,
      isFinished: false,
      words: [word('apple', '苹果'), word('retired', '旧词'), word('apple', '苹果')],
    },
  ]
  await page.route('**/seed-memo', (route) => route.fulfill({ contentType: 'text/html', body: '<html></html>' }))
  await page.goto('/seed-memo')
  await page.evaluate(
    async (data) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('RecordDB', 40)
        request.onupgradeneeded = () => {
          const words = request.result.createObjectStore('wordRecords', { keyPath: 'id', autoIncrement: true })
          for (const key of ['word', 'timeStamp', 'dict', 'chapter', 'wrongCount']) words.createIndex(key, key)
          words.createIndex('[dict+chapter]', ['dict', 'chapter'])
          const chapters = request.result.createObjectStore('chapterRecords', { keyPath: 'id', autoIncrement: true })
          for (const key of ['timeStamp', 'dict', 'chapter', 'time']) chapters.createIndex(key, key)
          chapters.createIndex('[dict+chapter]', ['dict', 'chapter'])
          const reviews = request.result.createObjectStore('reviewRecords', { keyPath: 'id', autoIncrement: true })
          for (const key of ['dict', 'createTime', 'isFinished']) reviews.createIndex(key, key)
          const books = request.result.createObjectStore('customDictionaries', { keyPath: 'id' })
          for (const key of ['studyDate', 'updatedAt']) books.createIndex(key, key)
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(['customDictionaries', 'wordRecords', 'chapterRecords', 'reviewRecords'], 'readwrite')
        data.books.forEach((row) => transaction.objectStore('customDictionaries').put(row))
        data.words.forEach((row) => transaction.objectStore('wordRecords').put(row))
        data.chapters.forEach((row) => transaction.objectStore('chapterRecords').put(row))
        data.reviews.forEach((row) => transaction.objectStore('reviewRecords').put(row))
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
      database.close()
      localStorage.setItem('currentDict', JSON.stringify(data.selected))
    },
    { books, words, chapters, reviews, selected: olderId },
  )
  await page.goto('/')
  await expect(page.getByRole('link', { name: `今日词汇 · ${oldest}`, exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('link', { name: `今日词汇 · ${oldest}`, exact: true })).toBeVisible()
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect((await readData(page)).books).toHaveLength(3)
  expect((await readData(page)).words).toEqual(words)
  await openMemo(page)
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await expect(page.getByRole('button', { name: '导入 2 词', exact: true })).toBeEnabled()
  expect((await readData(page)).books).toHaveLength(3)
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await expect(page.getByText('已保存 2 词')).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.goto('/')
  await expect(page.getByRole('link', { name: '往日词汇', exact: true })).toBeVisible()
  const result = await readData(page)
  expect(result.books.map((book) => book.id).sort()).toEqual([todayId, 'maimemo-history'].sort())
  const history = result.books.find((book) => book.id === 'maimemo-history')
  if (!history) throw new Error('History book was not created')
  expect(history.words.map((word) => word.name.trim().toLowerCase()).sort()).toEqual(['apple', 'banana', 'cherry', 'retired'])
  expect(history.words.find((word) => word.name === 'Apple')?.trans).toEqual(['苹果公司', '苹果'])
  expect(Object.keys(history.historySources ?? {}).sort()).toEqual([olderId, recentId].sort())
  expect(result.words).toEqual(
    words.map((row) => (row.dict === todayId ? row : { ...row, dict: 'maimemo-history', originalDict: row.dict })),
  )
  expect(result.chapters).toEqual(chapters.map((row) => ({ ...row, dict: 'maimemo-history', originalDict: row.dict })))
  expect(result.reviews).toEqual(reviews.map((row) => ({ ...row, dict: 'maimemo-history', originalDict: row.dict })))
  await page.reload()
  await expect(page.getByRole('link', { name: '往日词汇', exact: true })).toBeVisible()
  expect((await readData(page)).books.find((book) => book.id === 'maimemo-history')?.updatedAt).toBe(history.updatedAt)
  await page.goto('/error-book')
  await expect(page.getByText('旧词', { exact: true })).toBeVisible()
  await expect(page.getByText(/苹果公司/).first()).toBeVisible()
  // A pending practice/review write may finish after its daily book has been archived.
  const lateReview = { ...reviews[0], id: 32, index: 2 }
  // Keep native import() inside the browser, without Playwright's CommonJS transform.
  await page.evaluate(`(async () => {
    const { db } = await import('/src/utils/db/core.ts')
    const { putStudyRecord } = await import('/src/utils/db/memo-rollover.ts')
    await putStudyRecord(db.reviewRecords, ${JSON.stringify(lateReview)})
  })()`)
  expect((await readData(page)).reviews).toContainEqual({ ...lateReview, dict: 'maimemo-history', originalDict: recentId })
})

test('crossing 04:00 keeps the daily book until the next import archives it', async ({ page }) => {
  await installStudyClock(page)
  await openMemo(page)
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await page.getByRole('button', { name: '开始练习' }).click()
  await expect(page.getByRole('link', { name: '今日词汇 · 2026-10-22', exact: true })).toBeVisible()
  await page.keyboard.press('Enter')
  await page.keyboard.type('apple')
  await expect(page.getByText('香蕉', { exact: true })).toBeVisible()
  await page.evaluate(() => (window as Window & { setStudyClock: (value: string) => void }).setStudyClock('2026-10-22T20:00:00.000Z'))
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
  })
  // Wait beyond the former rollover timer to verify there is no background archive.
  await page.waitForTimeout(1200)
  await expect(page.getByRole('link', { name: '今日词汇 · 2026-10-22', exact: true })).toBeVisible()
  expect((await readData(page)).books.map((book) => book.id)).toEqual(['maimemo-2026-10-22'])
  await page.route('**/api/memo/today', (route) =>
    route.fulfill({ json: { date: '2026-10-23', fetchedAt: '2026-10-22T20:00:00Z', completed: 2, items: todayItems } }),
  )
  await page.getByRole('link', { name: '今日词汇 · 2026-10-22', exact: true }).click()
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await expect(page.getByText('已保存 2 词')).toBeVisible()
  const data = await readData(page)
  expect(data.books.map((book) => book.id).sort()).toEqual(['maimemo-2026-10-23', 'maimemo-history'])
  expect(data.words).toHaveLength(1)
  expect(data.words[0]).toMatchObject({ dict: 'maimemo-history', originalDict: 'maimemo-2026-10-22', word: 'apple', wrongCount: 0 })
})

test('a preview read before 04:00 cannot be imported into the new study day', async ({ page }) => {
  await installStudyClock(page)
  await openMemo(page)
  await page.getByRole('button', { name: '导入今日词汇', exact: true }).click()
  await expect(page.getByRole('button', { name: '导入 2 词', exact: true })).toBeEnabled()
  await page.evaluate(() => (window as Window & { setStudyClock: (value: string) => void }).setStudyClock('2026-10-22T20:00:00.000Z'))
  await page.getByRole('button', { name: '导入 2 词', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('已跨过北京时间 04:00')
  expect((await readData(page)).books).toHaveLength(0)
})

test('Token settings save and clear through the service without storing the secret in browser data', async ({ page }) => {
  let configured = false
  const received: string[] = []
  await page.route('**/api/memo/settings', async (route) => {
    const method = route.request().method()
    if (method === 'POST') {
      received.push(route.request().postDataJSON().token)
      configured = true
    }
    if (method === 'DELETE') configured = false
    await route.fulfill({ json: { configured, source: configured ? 'saved' : 'none' } })
  })
  await page.goto('/')
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '墨墨设置', exact: true }).click()
  const input = page.getByLabel('墨墨 Token', { exact: true })
  await expect(input).toHaveAttribute('type', 'password')
  await input.fill('test-only-browser-token')
  await expect(page.getByRole('button', { name: '保存 Token', exact: true })).toBeEnabled()
  await input.press('Enter')
  await expect(page.getByText('Token 已保存，立即生效。')).toBeVisible()
  await expect(input).toHaveValue('')
  expect(received).toEqual(['test-only-browser-token'])
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('test-only-browser-token')
  await page.reload()
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '墨墨设置', exact: true }).click()
  await expect(page.getByText('已配置墨墨 Token', { exact: true })).toBeVisible()
  await expect(page.getByLabel('墨墨 Token', { exact: true })).toHaveValue('')
  await page.getByRole('button', { name: '清除配置', exact: true }).click()
  await expect(page.getByText('已清除 Token，墨墨导入已停用。')).toBeVisible()
  expect(configured).toBe(false)
})
