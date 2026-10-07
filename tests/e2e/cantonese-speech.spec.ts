import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'

type MockVoice = {
  name: string
  lang: string
  voiceURI: string
  localService: boolean
  default: boolean
}

const mandarinVoice: MockVoice = {
  name: 'Microsoft Huihui',
  lang: 'zh-CN',
  voiceURI: 'mock-mandarin',
  localService: true,
  default: true,
}

const cantoneseVoice: MockVoice = {
  name: 'Microsoft HiuMaan',
  lang: 'zh-HK',
  voiceURI: 'mock-cantonese',
  localService: true,
  default: false,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const localCantoneseVoice = {
      name: 'Microsoft HiuMaan',
      lang: 'zh-HK',
      voiceURI: 'mock-cantonese',
      localService: true,
      default: false,
    }
    let voices = localStorage.getItem('__mock_cantonese_available') ? [localCantoneseVoice] : []
    const listeners = new Set<() => void>()
    const calls: Array<Record<string, unknown>> = []
    let cancelCount = 0
    let currentUtterance: MockUtterance | null = null

    class MockUtterance {
      text: string
      voice: typeof localCantoneseVoice | null = null
      lang = ''
      volume = 1
      rate = 1
      onend: (() => void) | null = null
      onerror: ((event: { error: string }) => void) | null = null

      constructor(text: string) {
        this.text = text
      }
    }

    const speechSynthesis = {
      getVoices: () => voices,
      addEventListener: (event: string, listener: () => void) => {
        if (event === 'voiceschanged') listeners.add(listener)
      },
      removeEventListener: (event: string, listener: () => void) => {
        if (event === 'voiceschanged') listeners.delete(listener)
      },
      speak: (utterance: MockUtterance) => {
        currentUtterance = utterance
        calls.push({
          text: utterance.text,
          voiceURI: utterance.voice?.voiceURI ?? null,
          lang: utterance.lang,
          volume: utterance.volume,
          rate: utterance.rate,
          usedCurrentVoice: utterance.voice === voices.find((voice) => voice.voiceURI === utterance.voice?.voiceURI),
        })
      },
      cancel: () => {
        cancelCount += 1
        const utterance = currentUtterance
        currentUtterance = null
        utterance?.onerror?.({ error: 'canceled' })
      },
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speechSynthesis })
    Object.defineProperty(window, '__speechMock', {
      configurable: true,
      value: {
        calls,
        get cancelCount() {
          return cancelCount
        },
        setVoices(nextVoices: typeof voices) {
          voices = nextVoices
          listeners.forEach((listener) => listener())
        },
      },
    })

    localStorage.setItem('currentDict', JSON.stringify('ielts'))
    localStorage.setItem('currentChapter', JSON.stringify(0))
    if (!localStorage.getItem('pronunciation') && !localStorage.getItem('__skip_mock_pronunciation')) {
      localStorage.setItem(
        'pronunciation',
        JSON.stringify({
          isOpen: false,
          volume: 1,
          type: 'us',
          name: '美音',
          isLoop: false,
          isTransRead: true,
          transVolume: 0.8,
          transRate: 0.9,
          transSpeechMode: 'cantonese',
          transVoiceURI: '',
          transVoiceName: '',
          transVoiceLang: '',
          rate: 1,
        }),
      )
    }
  })

  await page.goto('/')
  const closeStartCard = page.getByLabel('关闭提示')
  if (await closeStartCard.isVisible().catch(() => false)) {
    await closeStartCard.click()
  }
  await expect(page.getByText('IELTS').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '用粤语朗读中文释义' })).toBeVisible()
  await page.keyboard.press('Enter')
})

test('prevents Mandarin fallback, restores the selected voice and reports a missing voice', async ({ page }) => {
  await page.evaluate((voice) => {
    ;(window as typeof window & { __speechMock: { setVoices: (voices: MockVoice[]) => void } }).__speechMock.setVoices([voice])
  }, mandarinVoice)

  await page.getByRole('button', { name: '用粤语朗读中文释义' }).click()
  await expect(page.getByText('没有找到可用粤语声音，已阻止普通话回退')).toBeVisible()
  expect(await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)).toBe(0)

  await page.evaluate((voice) => {
    ;(window as typeof window & { __speechMock: { setVoices: (voices: MockVoice[]) => void } }).__speechMock.setVoices([voice])
  }, cantoneseVoice)

  await page.getByTitle('打开设置对话框').click()
  await expect(page.getByLabel('粤语声音')).toContainText('Microsoft HiuMaan')
  await page.getByLabel('粤语声音').selectOption('mock-cantonese')
  await page.getByRole('button', { name: '试听粤语' }).click()

  const previewCall = await page.evaluate(() => {
    const calls = (window as typeof window & { __speechMock: { calls: Array<Record<string, unknown>> } }).__speechMock.calls
    return calls.at(-1)
  })
  expect(previewCall).toMatchObject({
    text: '环境，发展，教育，研究',
    voiceURI: 'mock-cantonese',
    lang: 'zh-HK',
    volume: 0.8,
    rate: 0.9,
    usedCurrentVoice: true,
  })

  const savedConfig = await page.evaluate(() => JSON.parse(localStorage.getItem('pronunciation') ?? '{}'))
  expect(savedConfig).toMatchObject({
    isTransRead: true,
    transSpeechMode: 'cantonese',
    transVoiceURI: 'mock-cantonese',
    transVoiceName: 'Microsoft HiuMaan',
    transVoiceLang: 'zh-HK',
  })

  await page.evaluate(() => localStorage.setItem('__mock_cantonese_available', 'true'))
  await page.reload()
  await expect(page.getByRole('button', { name: '用粤语朗读中文释义' })).toBeVisible()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: '用粤语朗读中文释义' }).click()

  const restoredCall = await page.evaluate(() => {
    const calls = (window as typeof window & { __speechMock: { calls: Array<Record<string, unknown>> } }).__speechMock.calls
    return calls.at(-1)
  })
  expect(restoredCall).toMatchObject({ voiceURI: 'mock-cantonese', lang: 'zh-HK', usedCurrentVoice: true })

  await page.evaluate((voice) => {
    ;(window as typeof window & { __speechMock: { setVoices: (voices: MockVoice[]) => void } }).__speechMock.setVoices([voice])
  }, mandarinVoice)
  await page.getByTitle('打开设置对话框').click()
  await expect(page.getByRole('status').filter({ hasText: '原声音当前不可用，请重新选择' }).last()).toBeVisible()
  const callCount = await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)
  await page.getByRole('dialog').getByTitle('关闭对话框').click()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: '用粤语朗读中文释义' }).click()
  await expect(page.getByText('原声音当前不可用，请重新选择')).toBeVisible()
  expect(await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)).toBe(
    callCount,
  )
})

test('cancels queued definition speech and keeps list Cantonese clicks separate', async ({ page }) => {
  await page.evaluate((voice) => {
    ;(window as typeof window & { __speechMock: { setVoices: (voices: MockVoice[]) => void } }).__speechMock.setVoices([voice])
    const config = JSON.parse(localStorage.getItem('pronunciation') ?? '{}')
    localStorage.setItem(
      'pronunciation',
      JSON.stringify({
        ...config,
        transVoiceURI: voice.voiceURI,
        transVoiceName: voice.name,
        transVoiceLang: voice.lang,
      }),
    )
    localStorage.setItem('__mock_cantonese_available', 'true')
  }, cantoneseVoice)
  await page.reload()
  await expect(page.getByRole('button', { name: '用粤语朗读中文释义' })).toBeVisible()
  await page.keyboard.press('Enter')

  const mainButton = page.getByRole('button', { name: '用粤语朗读中文释义' })
  await expect
    .poll(() => page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length))
    .toBe(1)
  const automaticCallCount = await page.evaluate(
    () => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length,
  )
  await mainButton.click()
  await mainButton.click()
  expect(await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)).toBe(
    automaticCallCount + 2,
  )
  expect(
    await page.evaluate(() => (window as typeof window & { __speechMock: { cancelCount: number } }).__speechMock.cancelCount),
  ).toBeGreaterThan(1)

  await page.getByRole('button', { name: '打开章节词表' }).click()
  const listButton = page.getByRole('button', { name: /^用粤语朗读 .* 的中文释义$/ }).first()
  await expect(listButton).toBeVisible()
  await page.evaluate(() => {
    Object.assign(window, { __listClickReachedWindow: false })
    window.addEventListener(
      'click',
      () => {
        Object.assign(window, { __listClickReachedWindow: true })
      },
      { once: true },
    )
  })
  await listButton.click()
  expect(await page.evaluate(() => (window as typeof window & { __listClickReachedWindow: boolean }).__listClickReachedWindow)).toBe(false)

  const listCall = await page.evaluate(() => {
    const calls = (window as typeof window & { __speechMock: { calls: Array<Record<string, unknown>> } }).__speechMock.calls
    return calls.at(-1)
  })
  expect(listCall).toMatchObject({ voiceURI: 'mock-cantonese', lang: 'zh-HK', usedCurrentVoice: true })
  expect(String(listCall?.text)).not.toBe('环境，发展，教育，研究')

  const cancelCountBeforeClose = await page.evaluate(
    () => (window as typeof window & { __speechMock: { cancelCount: number } }).__speechMock.cancelCount,
  )
  await page.getByRole('button', { name: '关闭章节词表' }).click()
  expect(
    await page.evaluate(() => (window as typeof window & { __speechMock: { cancelCount: number } }).__speechMock.cancelCount),
  ).toBeGreaterThan(cancelCountBeforeClose)
})

test('plays Cantonese automatically after the English audio ends', async ({ page }) => {
  await page.route('https://dict.youdao.com/dictvoice?**', async (route) => {
    await route.fulfill({
      path: resolve(process.cwd(), 'public/sounds/click.wav'),
      contentType: 'audio/wav',
      headers: { 'access-control-allow-origin': '*' },
    })
  })

  await page.evaluate((voice) => {
    const config = JSON.parse(localStorage.getItem('pronunciation') ?? '{}')
    localStorage.setItem(
      'pronunciation',
      JSON.stringify({
        ...config,
        isOpen: true,
        isLoop: true,
        transVoiceURI: voice.voiceURI,
        transVoiceName: voice.name,
        transVoiceLang: voice.lang,
      }),
    )
    localStorage.setItem('__mock_cantonese_available', 'true')
  }, cantoneseVoice)

  await page.reload()
  await expect(page.getByRole('button', { name: '用粤语朗读中文释义' })).toBeVisible()
  await page.keyboard.press('Enter')

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          type MockHowl = { _src: string | string[]; _sounds: unknown[] }
          const howls = (window as typeof window & { Howler: { _howls: MockHowl[] } }).Howler._howls
          return howls.some((howl) => String(howl._src).includes('dictvoice') && howl._sounds.length > 0)
        }),
      { timeout: 10_000 },
    )
    .toBe(true)

  expect(await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)).toBe(0)
  await page.evaluate(() => {
    type MockHowl = {
      _src: string | string[]
      _sounds: Array<{ _id: number; _paused: boolean }>
      _emit: (event: string, id: number) => void
    }
    const howls = (window as typeof window & { Howler: { _howls: MockHowl[] } }).Howler._howls
    const currentHowl = [...howls].reverse().find((howl) => String(howl._src).includes('dictvoice'))
    const currentSound = currentHowl?._sounds.find((sound) => !sound._paused) ?? currentHowl?._sounds[0]
    if (!currentHowl || !currentSound) throw new Error('English pronunciation did not start')
    currentHowl._emit('end', currentSound._id)
  })

  await expect
    .poll(() => page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length))
    .toBe(1)

  const automaticCall = await page.evaluate(() => {
    const calls = (window as typeof window & { __speechMock: { calls: Array<Record<string, unknown>> } }).__speechMock.calls
    return calls[0]
  })
  expect(automaticCall).toMatchObject({ voiceURI: 'mock-cantonese', lang: 'zh-HK', usedCurrentVoice: true })
  expect(String(automaticCall?.text).length).toBeGreaterThan(0)

  await page.waitForTimeout(500)
  expect(await page.evaluate(() => (window as typeof window & { __speechMock: { calls: unknown[] } }).__speechMock.calls.length)).toBe(1)
})

test('keeps existing definition settings while adding the new defaults', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('__skip_mock_pronunciation', 'true')
    localStorage.removeItem('pronunciation')
  })
  await page.reload()
  await expect(page.getByText('IELTS').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '跟随系统朗读中文释义' })).toHaveCount(0)
  await page.getByTitle('打开设置对话框').click()
  await expect(page.getByLabel('释义发音模式')).toHaveValue('system')
  await page.getByRole('dialog').getByTitle('关闭对话框').click()

  await page.evaluate(() => {
    localStorage.setItem(
      'pronunciation',
      JSON.stringify({
        isOpen: true,
        volume: 1,
        type: 'us',
        name: '美音',
        isLoop: false,
        isTransRead: true,
        transVolume: 0.6,
        rate: 1,
      }),
    )
  })
  await page.reload()
  await expect(page.getByRole('button', { name: '跟随系统朗读中文释义' })).toBeVisible()

  const upgradedConfig = await page.evaluate(() => JSON.parse(localStorage.getItem('pronunciation') ?? '{}'))
  expect(upgradedConfig).toMatchObject({
    isTransRead: true,
    transVolume: 0.6,
    transSpeechMode: 'system',
    transVoiceURI: '',
    transRate: 1,
  })
})
