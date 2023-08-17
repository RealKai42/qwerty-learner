import type { IWordRecord } from '@/utils/db/record'

export type groupedWordRecords = {
  word: string
  dict: string
  records: IWordRecord[]
  wrongCount: number
}
