import type { Dictionary, Word } from '.'

export const memoResponseOptions = [
  { value: 'FORGET', label: '忘记' },
  { value: 'VAGUE', label: '模糊' },
  { value: 'FAMILIAR', label: '记忆（认识）' },
  { value: 'WELL_FAMILIAR', label: '熟知' },
  { value: 'OTHER', label: '其他反馈' },
] as const

export type MemoResponseType = (typeof memoResponseOptions)[number]['value']
export type MemoItem = { vocId: string; response: string; isNew: boolean; word: Word }
export type MemoToday = { date: string; fetchedAt: string; items: MemoItem[]; completed: number }
export type CustomDictionary = Dictionary & {
  source: 'maimemo'
  studyDate: string
  updatedAt: number
  responseTypes: MemoResponseType[]
  words: Word[]
  // Keep removed words available to historical error records and exports.
  wordArchive: Word[]
}
