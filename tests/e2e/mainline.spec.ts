import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const silentAudio = readFileSync('tests/e2e/fixtures/silent.m4a')

// CET-4 chapter 1 is fixed in useWordList. The screen is still read back
// before each word, so a changed chapter fails on the word that is showing.
const FIRST_WORD = 'cancel'
const SECOND_WORD = 'explosive'

async function readWord(page: Page): Promise<string> {
  return page.evaluate(() => {
    return [...document.querySelectorAll('span.font-mono')]
      .filter((span) => Number.parseFloat(getComputedStyle(span).fontSize) >= 40)
      .map((span) => (span.textContent === '\u2423' ? ' ' : span.textContent ?? ''))
      .join('')
  })
}

async function letterClass(page: Page, index: number): Promise<string> {
  return page.evaluate((letterIndex) => {
    const letters = [...document.querySelectorAll('span.font-mono')].filter(
      (span) => Number.parseFloat(getComputedStyle(span).fontSize) >= 40,
    )
    return letters[letterIndex]?.className ?? ''
  }, index)
}

async function playsOf(page: Page, word: string): Promise<number> {
  const plays = await page.evaluate(() => (window as Window & { __pronPlays?: string[] }).__pronPlays ?? [])
  return plays.filter((name) => name === word).length
}

async function practiceAccuracy(page: Page): Promise<number> {
  return page.evaluate(() => {
    const label = [...document.querySelectorAll('span')].find((span) => span.textContent === '正确率')
    return Number(label?.previousElementSibling?.textContent ?? '')
  })
}

async function typeWord(page: Page, word: string) {
  for (const letter of word) {
    await page.keyboard.press(letter)
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const store = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
    store('currentDict', 'cet4')
    store('currentChapter', 0)
    store('randomConfig', { isOpen: false })
    store('pronunciation', {
      isOpen: true,
      volume: 1,
      type: 'us',
      name: '美音',
      isLoop: false,
      isTransRead: false,
      transVolume: 1,
      rate: 1,
    })
    store('wordDictationConfig', { isOpen: false, type: 'hideAll', openBy: 'auto' })
    store('dismissStartCardDate', '2020-01-01T00:00:00.000Z')
    store('hasSeenEnhancedPromotion', true)

    const plays: string[] = []
    ;(window as Window & { __pronPlays?: string[] }).__pronPlays = plays
    const originalPlay = HTMLAudioElement.prototype.play
    HTMLAudioElement.prototype.play = function play(this: HTMLAudioElement) {
      const src = this.currentSrc || this.src
      if (src.includes('dictvoice')) {
        plays.push(new URL(src).searchParams.get('audio') ?? '')
      }
      const pending = originalPlay.call(this)
      pending.catch(() => undefined)
      return pending
    }
  })

  // Prefetch downloads the next word without playing it. Count play() calls.
  await page.route('**/dict.youdao.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'audio/mp4',
      body: silentAudio,
    }),
  )
})

test('types a chapter, marks a mistake, reads each new word, and opens the next chapter', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('按任意键开始')).toBeVisible()
  await expect(page.getByLabel('关闭提示')).toHaveCount(0)
  await expect.poll(() => readWord(page)).toBe(FIRST_WORD)

  // The first word is loaded on the idle screen and must stay quiet.
  await page.waitForTimeout(800)
  expect(await playsOf(page, FIRST_WORD)).toBe(0)

  await page.keyboard.press('Enter')
  await expect(page.getByText('按任意键开始')).toBeHidden()
  await expect.poll(() => playsOf(page, FIRST_WORD)).toBe(1)

  await page.keyboard.press('x')
  await expect.poll(() => letterClass(page, 0)).toMatch(/text-red-600/)
  await expect.poll(() => letterClass(page, 0)).toMatch(/text-gray-600/)
  expect(await playsOf(page, FIRST_WORD)).toBe(1)

  await page.keyboard.press(FIRST_WORD[0])
  await expect.poll(() => letterClass(page, 0)).toMatch(/text-green-600/)
  await typeWord(page, FIRST_WORD.slice(1))

  await expect.poll(() => readWord(page)).toBe(SECOND_WORD)
  await expect.poll(() => playsOf(page, SECOND_WORD)).toBe(1)
  await expect
    .poll(async () => {
      const accuracy = await practiceAccuracy(page)
      return accuracy > 0 && accuracy < 100
    })
    .toBe(true)

  const playsBeforeLetter = await playsOf(page, SECOND_WORD)
  await page.keyboard.press(SECOND_WORD[0])
  await expect.poll(() => letterClass(page, 0)).toMatch(/text-green-600/)
  await page.waitForTimeout(500)
  expect(await playsOf(page, SECOND_WORD)).toBe(playsBeforeLetter)

  await page.locator('button.h-full.w-full').click()
  await expect.poll(() => playsOf(page, SECOND_WORD)).toBe(playsBeforeLetter + 1)
  await typeWord(page, SECOND_WORD.slice(1))
  await expect.poll(() => readWord(page)).not.toBe(SECOND_WORD)

  for (let guard = 0; guard < 20; guard += 1) {
    if (await page.getByRole('button', { name: '下一章节' }).isVisible()) break

    const word = await readWord(page)
    expect(word).not.toBe('')
    await typeWord(page, word)
    await expect
      .poll(async () => {
        if (await page.getByRole('button', { name: '下一章节' }).isVisible()) return 'done'
        return readWord(page)
      })
      .not.toBe(word)
  }

  const nextChapter = page.getByRole('button', { name: '下一章节' })
  await expect(nextChapter).toBeVisible()
  await expect(page.getByTitle(`朗读 ${FIRST_WORD}`)).toBeVisible()
  await expect(page.getByText(/^\d+%$/)).not.toHaveText('100%')

  await nextChapter.click()
  await expect(page.getByRole('button', { name: '第 2 章' })).toBeVisible()
  await expect.poll(() => readWord(page)).not.toBe(FIRST_WORD)
})
