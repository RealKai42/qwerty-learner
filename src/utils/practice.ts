import type { PracticeContentType, Word } from '@/typings'

export function normalizePracticeText(text: string): string {
  return text.normalize('NFC').replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/\s+/g, ' ').trim()
}

export function practiceContentType(word: Pick<Word, 'name' | 'contentType'>, language = 'en'): PracticeContentType {
  if (word.contentType) return word.contentType
  if (language !== 'en' || !/\s/.test(word.name.trim())) return 'word'
  return /[.!?…]["'”’)]?$/.test(word.name.trim()) ? 'sentence' : 'phrase'
}

export function hasTextItems(words: Word[]): boolean {
  return words.some((word) => word.contentType === 'phrase' || word.contentType === 'sentence')
}

export const contentTypeLabels: Record<PracticeContentType, string> = { word: '单词', phrase: '短语', sentence: '句子' }
