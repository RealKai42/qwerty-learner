import { CHAPTER_LENGTH } from '@/constants'
import type { Howl } from 'howler'

export * from './mixpanel'

const bannedKeys = [
  'Enter',
  'Backspace',
  'Delete',
  'Tab',
  'CapsLock',
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'Escape',
  'Fn',
  'FnLock',
  'Hyper',
  'Super',
  'OS',
  // Up, down, left and right keys
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  // volume keys
  'AudioVolumeUp',
  'AudioVolumeDown',
  'AudioVolumeMute',
  // special keys
  'End',
  'PageDown',
  'PageUp',
  'Clear',
  'Home',
]

// A typed letter is one printable character. Named keys such as "F5" stay
// with the browser, so they are not counted as mistakes.
export const isLegal = (key: string): boolean => {
  if (typeof key !== 'string' || key.length !== 1) return false
  if (key < ' ' || key === '\u007f') return false
  if (bannedKeys.includes(key)) return false
  return true
}

// Text a CJK IME commits: punctuation, kana, hanzi, fullwidth forms, ellipsis, and em dash.
// Curly quotes are folded to straight quotes separately, so don't / it's still complete.
// "|" is not included. The old character class matched it only because "|" is literal inside [].
const IME_TEXT = /[\u3000-\u303f\u3040-\u30ff\u31f0-\u31ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef\u2026\u2014\ufe43\ufe44\ufe4f]/

export function isImeText(value: string): boolean {
  return IME_TEXT.test(value)
}

// Smart quotes from an IME or the OS. Words in this app use straight quotes.
export function straightenQuotes(value: string): string {
  return value.replace(/[\u2018\u2019\u201a\u201b]/g, "'").replace(/[\u201c\u201d\u201e\u201f]/g, '"')
}

export const IsDesktop = () => {
  const userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']

  let flag = true
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

export const IS_MAC_OS = navigator.userAgent.indexOf('Macintosh') !== -1

export const CTRL = IS_MAC_OS ? 'Control' : 'Ctrl'

export function addHowlListener(howl: Howl, ...args: Parameters<Howl['on']>) {
  howl.on(...args)

  return () => howl.off(...args)
}

export function classNames(...classNames: Array<string | void | null>) {
  const finallyClassNames: string[] = []

  for (const className of classNames) {
    if (className) {
      finallyClassNames.push(className.trim())
    }
  }

  return finallyClassNames.join(' ')
}

export function getCurrentDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)

  return `${year}${month}${day}`
}

export function calcChapterCount(length: number) {
  return Math.ceil(length / CHAPTER_LENGTH)
}

export function findCommonValues<T>(xs: T[], ys: T[]): T[] {
  const set = new Set(ys)
  return xs.filter((x) => set.has(x))
}

export function toFixedNumber(number: number, fractionDigits: number) {
  return Number((number ?? 0).toFixed(fractionDigits))
}

export function getUTCUnixTimestamp() {
  const now = new Date()
  return Math.floor(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds(),
    ) / 1000,
  )
}

export function timeStamp2String(timestamp: number) {
  const date = new Date(timestamp * 1000)

  const dateString = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  const timeString = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  return `${dateString} ${timeString}`
}
