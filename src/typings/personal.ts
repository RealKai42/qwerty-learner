import type { Dictionary, Word } from '.'
import type { CustomDictionary } from './memo'

export type PersonalDictionary = Dictionary & {
  source: 'custom'
  studyDate: ''
  updatedAt: number
  words: Word[]
  wordArchive: Word[]
}

export type StoredDictionary = CustomDictionary | PersonalDictionary
