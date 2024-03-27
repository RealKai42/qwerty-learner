export type KeymapItem = {
  action: string
  hotkey: string
}

export const initKeyMaps: KeymapItem[] = [
  {
    action: '切换是否显示翻译',
    hotkey: 'ctrl+shift+v',
  },
  {
    action: '暂时显示翻译',
    hotkey: 'tab',
  },
  {
    action: '切换听写模式',
    hotkey: 'ctrl+v',
  },
  {
    action: '暂时显示单词',
    hotkey: 'tab',
  },
  {
    action: '暂停打字',
    hotkey: 'enter',
  },
  {
    action: '下一章',
    hotkey: 'enter',
  },
  {
    action: '重复本章',
    hotkey: 'space',
  },
  {
    action: '开始听写',
    hotkey: 'shift+enter',
  },
  {
    action: '播放发音',
    hotkey: 'ctrl+j',
  },
  {
    action: '下一个词',
    hotkey: 'ctrl+shift+arrowright',
  },
  {
    action: '上一个词',
    hotkey: 'ctrl+shift+arrowleft',
  },
]
