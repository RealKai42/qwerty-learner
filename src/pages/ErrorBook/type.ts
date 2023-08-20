import type { WordRecord } from '@/utils/db/record'

export type groupedWordRecords = {
  word: string
  dict: string
  records: WordRecord[]
  wrongCount: number
}
