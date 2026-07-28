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

export const isLegal = (key: string): boolean => {
  if (bannedKeys.includes(key)) return false
  return true
}

export const isChineseSymbol = (val: string): boolean =>
  /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(
    val,
  )

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

/**
 * 只认 Control 的快捷键用这个标签。
 *
 * 对应的组合键在 macOS 上不能改用 Command：`⌘V` 是粘贴，`⌘D` 是浏览器收藏
 * （StarCard 正是在引导用户按 ⌘D 收藏本站），抢过来会破坏系统级约定。
 */
export const CTRL = IS_MAC_OS ? 'Control' : 'Ctrl'

/**
 * Control 与 Command 都能触发的快捷键用这个标签，对应 useHotkeys 的 `mod` 修饰键。
 *
 * `mod` 匹配 ctrlKey 或 metaKey，因此 macOS 用户可以按 ⌘，
 * 原有的 Ctrl 习惯和其他平台的用法都不受影响。
 */
export const MOD = IS_MAC_OS ? '⌘' : 'Ctrl'

/**
 * 词性缩写：n. vt. adj. 之类。长的排在前面，否则 `int` 会先吃掉 `interj.` 的一半。
 *
 * 几个刻意排除的：
 * - `a.`   词库里绝大多数是 `9 a.m.`，去掉会把时间拆成 "m"
 * - `sb.` / `sth.`  是「某人 / 某物」占位符，在 `define sth. as` 这类搭配里有实义
 * - `past.`  多数出现在英文句尾（`the past.`），并非词性标记
 */
const PART_OF_SPEECH_PATTERN = /\b(interj|int|prep|pron|conj|abbr|adj|adv|aux|art|num|pl|na|ad|vt|vi|v|n)\s*\./gi

/**
 * 把释义转成适合朗读的文本：去掉词性缩写。
 *
 * 屏幕上仍然完整显示，只是不念出来——语音合成会把 "vt." 逐字母读出来，
 * 夹在中文释义里很突兀。
 */
export function toSpeechText(trans: string): string {
  return (
    trans
      // 换成空格而非删除：词库里大量释义没在缩写前留空格（如「皈依n. 皈依者」），
      // 直接删掉会把两条释义粘成一个词。
      .replace(PART_OF_SPEECH_PATTERN, ' ')
      .replace(/&/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s;；,，、]+/, '')
      .trim()
  )
}

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
