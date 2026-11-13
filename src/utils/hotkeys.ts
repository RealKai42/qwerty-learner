import { IS_MAC_OS } from './platform'

const MODIFIER_KEY_MAP: Record<string, string> = {
  ctrl: IS_MAC_OS ? '⌃' : 'Ctrl',
  control: IS_MAC_OS ? '⌃' : 'Ctrl',
  shift: IS_MAC_OS ? '⇧' : 'Shift',
  alt: IS_MAC_OS ? '⌥' : 'Alt',
  option: IS_MAC_OS ? '⌥' : 'Alt',
  meta: IS_MAC_OS ? '⌘' : 'Win',
  cmd: IS_MAC_OS ? '⌘' : 'Win',
}

const KEY_NAME_MAP: Record<string, string> = {
  arrowleft: '←',
  arrowright: '→',
  arrowup: '↑',
  arrowdown: '↓',
  space: 'Space',
  esc: 'Esc',
  tab: 'Tab',
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  comma: ',',
  period: '.',
  slash: '/',
  semicolon: ';',
  quote: "'",
  backslash: '\\',
  bracketleft: '[',
  bracketright: ']',
  minus: '-',
  equal: '=',
  backquote: '`',
}

export function formatShortcut(shortcut: string): string {
  return shortcut
    .split('+')
    .map((part) => {
      const key = part.trim().toLowerCase()
      return MODIFIER_KEY_MAP[key] || KEY_NAME_MAP[key] || key.toUpperCase()
    })
    .join(' + ')
}

export function eventToShortcut(e: KeyboardEvent): string | null {
  const mods: string[] = []
  if (e.ctrlKey) mods.push('ctrl')
  if (e.altKey) mods.push('alt')
  if (e.shiftKey) mods.push('shift')
  if (e.metaKey) mods.push('meta')

  const mainKey = e.key.toLowerCase()
  if (['control', 'shift', 'alt', 'meta'].includes(mainKey)) return null

  if (mods.length === 0 && mainKey.length === 1) return null

  const keyName = mainKey === ' ' ? 'space' : mainKey
  return [...mods, keyName].join('+')
}
