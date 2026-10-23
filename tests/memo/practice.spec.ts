import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { gunzipSync } from 'node:zlib'

type Book = { id: string; source: string; studyDate: string; words: { name: string; trans: string[]; contentType?: string }[] }
type RecordRow = {
  word: string
  dict: string
  wrongCount: number
  contentType?: string
  characterCount?: number
  statisticsVersion?: number
  practiceText?: string
  [key: string]: unknown
}
async function data(page: Page) {
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
        words: (await read('wordRecords')) as RecordRow[],
        chapters: (await read('chapterRecords')) as RecordRow[],
      }
    } finally {
      database.close()
    }
  })
}
async function openImport(page: Page) {
  await page.goto('/gallery')
  await page.getByRole('radio', { name: '自定义词书', exact: true }).click()
  await page.getByRole('button', { name: '导入短语/句子', exact: true }).click()
}
async function importAndStart(page: Page, text: string) {
  await openImport(page)
  await page.getByLabel('英文内容', { exact: true }).fill(text)
  await page.getByRole('button', { name: /^保存 \d+ 条$/ }).click()
  await expect(page.getByRole('status')).toContainText('已保存到')
  await page.getByRole('button', { name: '开始练习', exact: true }).click()
  await expect(page.getByRole('group', { name: '短语与句子练习' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenEnhancedPromotion', 'true')
    localStorage.setItem('dismissStartCardDate', 'true')
    localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
  })
  await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()))
})

for (const mode of ['backend', 'frontend'] as const) {
  test.describe(`${mode} practice`, () => {
    if (mode === 'frontend') test.use({ baseURL: 'http://127.0.0.1:4176' })
    test('phrases retain the correct prefix after errors and sentences accept spaces and punctuation', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await importAndStart(page, 'take care of\t照顾\nDon’t give up.\t不要放弃。\nCould you help me, please?\t你能帮帮我吗？')
      const practice = page.getByRole('group', { name: '短语与句子练习' })
      await page.keyboard.press('Enter')
      await page.keyboard.type('take x', { delay: 20 })
      await expect(practice).toHaveAttribute('data-input', 'take x')
      await page.waitForTimeout(350)
      await expect(practice).toHaveAttribute('data-input', 'take x')
      await page.keyboard.press('Backspace')
      await expect(practice).toHaveAttribute('data-input', 'take ')
      await page.keyboard.type('care of', { delay: 10 })
      await expect(page.getByText('不要放弃。', { exact: true })).toBeVisible()
      await page.keyboard.type("Don't give up.", { delay: 10 })
      await expect(page.getByText('你能帮帮我吗？', { exact: true })).toBeVisible()
      await page.keyboard.type('Could you help me, please?', { delay: 10 })
      await expect.poll(async () => (await data(page)).chapters.length).toBe(1)
      const result = await data(page)
      expect(result.books[0].source).toBe('custom')
      expect(result.words.map((record) => record.word)).toEqual(['take care of', 'Don’t give up.', 'Could you help me, please?'])
      expect(result.words[0]).toMatchObject({ wrongCount: 1, contentType: 'phrase', statisticsVersion: 2, characterCount: 12 })
      expect(result.words[1]).toMatchObject({ wrongCount: 0, practiceText: "Don't give up.", contentType: 'sentence' })
      expect(result.chapters[0]).toMatchObject({ wordCount: 3, statisticsVersion: 2, characterCount: 52 })
      await page.goto('/error-book')
      await expect(page.getByText('take care of', { exact: true })).toBeVisible()
      await expect(page.getByText('照顾', { exact: true })).toBeVisible()
      expect(errors).toEqual([])
    })
  })
}

test('TXT and JSON imports preview invalid rows, merge duplicates and definitions, and preserve existing practice', async ({ page }) => {
  await openImport(page)
  await page.getByLabel('选择文件', { exact: true }).setInputFiles({
    name: 'phrases.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('take care of\t照顾\ntake   care of\t负责\nKeep going.\t继续前进。'),
  })
  await expect(page.getByRole('status')).toHaveText('可导入 2 条，合并 1 条重复内容。')
  await page.getByRole('button', { name: '保存 2 条', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('共 2 条')
  const original = (await data(page)).books[0]
  expect(original.words[0].trans).toEqual(['照顾', '负责'])
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('button', { name: '导入短语/句子', exact: true }).click()
  await page.getByLabel('保存到', { exact: true }).selectOption(original.id)
  await page.getByLabel('英文内容', { exact: true }).fill('[{"name": ""}]')
  await expect(page.getByRole('alert')).toContainText('缺少英文内容')
  await expect(page.getByRole('button', { name: '保存 0 条', exact: true })).toBeDisabled()
  await page.getByLabel('选择文件', { exact: true }).setInputFiles({
    name: 'more.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify([
        { name: 'take care of', trans: ['照料'] },
        { text: 'Thank you', translation: '谢谢', contentType: 'sentence' },
      ]),
    ),
  })
  await page.getByRole('button', { name: '保存 2 条', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('共 3 条')
  const result = await data(page)
  expect(result.books).toHaveLength(1)
  expect(result.books[0].id).toBe(original.id)
  expect(result.books[0].words[0].trans).toEqual(['照顾', '负责', '照料'])
  expect(result.books[0].words[2]).toMatchObject({ name: 'Thank you', contentType: 'sentence' })
  await page.reload()
  await page.getByRole('radio', { name: '自定义词书', exact: true }).click()
  await expect(page.getByRole('button', { name: /我的短语与句子/ })).toBeVisible()
})

test('long sentences wrap and use browser speech with the configured language and rate', async ({ page }) => {
  await page.addInitScript(() => {
    const controlled = window as Window & { spoken: { text: string; lang: string; rate: number }[] }
    controlled.spoken = []
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (utterance: SpeechSynthesisUtterance) =>
          controlled.spoken.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate }),
        cancel: () => undefined,
        getVoices: () => [],
      },
    })
  })
  const sentence =
    'When you have a difficult day, take a deep breath and remember that every small step can bring you closer to your goals.'
  await importAndStart(page, sentence + '\t当你遇到困难时，深呼吸并继续前进。')
  await page.getByTitle('打开设置对话框').click()
  const pronunciationSwitch = page.getByRole('switch').first()
  if ((await pronunciationSwitch.getAttribute('aria-checked')) !== 'true') await pronunciationSwitch.click()
  const rate = page.getByRole('slider').nth(1)
  await rate.press('Home')
  await rate.press('ArrowRight')
  await rate.press('ArrowRight')
  await rate.press('ArrowRight')
  await page.getByTitle('关闭对话框').click()
  await page.getByRole('button', { name: /^美音/ }).first().click()
  await page.getByRole('button', { name: '美音', exact: true }).last().click()
  await page.getByRole('option', { name: '英音', exact: true }).click()
  await page.keyboard.press('Escape')
  const start = page.getByRole('button', { name: '开始', exact: true })
  if (await start.isVisible()) await start.click()
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
  const practice = page.getByRole('group', { name: '短语与句子练习' })
  const dimensions = await practice.evaluate((element) => ({
    width: element.clientWidth,
    scrollWidth: element.scrollWidth,
    rows: new Set(Array.from(element.querySelectorAll('[data-token]')).map((token) => Math.round(token.getBoundingClientRect().top))).size,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
  expect(dimensions.rows).toBeGreaterThan(1)
  await page
    .getByRole('button', { name: `朗读 ${sentence}`, exact: true })
    .first()
    .click()
  await expect.poll(() => page.evaluate(() => (window as Window & { spoken: unknown[] }).spoken.length)).toBeGreaterThan(0)
  const spoken = await page.evaluate(() => (window as Window & { spoken: { text: string; lang: string; rate: number }[] }).spoken.at(-1))
  expect(spoken).toMatchObject({ text: sentence, lang: 'en-GB' })
  expect(spoken?.rate).toBeCloseTo(0.8)
})

test('custom books and records survive backup restore and remain outside MaiMemo history merging', async ({ page, browser }) => {
  await importAndStart(page, 'take care of\t照顾\nKeep going.\t继续前进。')
  await page.keyboard.press('Enter')
  await page.keyboard.type('take care of', { delay: 10 })
  await expect(page.getByText('继续前进。', { exact: true })).toBeVisible()
  const original = await data(page)
  await page.getByTitle('打开设置对话框').click()
  await page.getByRole('tab', { name: '数据设置', exact: true }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出数据', exact: true }).click()
  const download = await downloaded
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Backup stream missing')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const backup = Buffer.concat(chunks)
  expect(gunzipSync(backup).toString()).toContain('take care of')
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4176' })
  try {
    const restored = await context.newPage()
    await restored.addInitScript(() => {
      localStorage.setItem('hasSeenEnhancedPromotion', 'true')
      localStorage.setItem('dismissStartCardDate', 'true')
      localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
    })
    await restored.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()))
    await restored.goto('/')
    await restored.getByTitle('打开设置对话框').click()
    await restored.getByRole('tab', { name: '数据设置', exact: true }).click()
    const chooser = restored.waitForEvent('filechooser')
    await restored.getByRole('button', { name: '导入数据', exact: true }).click()
    await (await chooser).setFiles({ name: download.suggestedFilename(), mimeType: 'application/gzip', buffer: backup })
    await expect.poll(async () => (await data(restored)).books.length).toBe(1)
    expect(await data(restored)).toEqual(original)
    // Exercise the actual archive routine at a later study date; custom rows are never candidates.
    await restored.evaluate(`(async () => {
      const { rolloverMemoDictionaries } = await import('/src/utils/db/memo-rollover.ts')
      await rolloverMemoDictionaries(new Date('2030-01-01T00:00:00Z'))
    })()`)
    expect(await data(restored)).toEqual(original)
    await restored.goto('/gallery')
    await restored.getByRole('radio', { name: '自定义词书', exact: true }).click()
    await expect(restored.getByRole('button', { name: /我的短语与句子/ })).toBeVisible()
  } finally {
    await context.close()
  }
})
