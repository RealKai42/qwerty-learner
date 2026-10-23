import { dictionaries, idDictionaryMap } from '@/resources/dictionary'
import type { Dictionary } from '@/typings'
import type { StoredDictionary } from '@/typings/personal'
import { atom } from 'jotai'

export const customDictionariesAtom = atom<Dictionary[]>([])
export const dictionariesReadyAtom = atom(false)
export const dictionariesErrorAtom = atom(false)
export const dictionariesAtom = atom((get) => [...get(customDictionariesAtom), ...dictionaries])
export const dictionaryMapAtom = atom((get) => {
  const map = { ...idDictionaryMap }
  get(customDictionariesAtom).forEach((dictionary) => {
    map[dictionary.id] = dictionary
    dictionary.aliases?.forEach((alias) => {
      map[alias] = dictionary
    })
  })
  return map
})

export function dictionaryMetadata(record: StoredDictionary): Dictionary {
  return {
    source: record.source,
    aliases: record.source === 'maimemo' ? Object.keys(record.historySources ?? {}) : [],
    id: record.id,
    name: record.source === 'maimemo' && record.id !== 'maimemo-history' ? `今日词汇 · ${record.studyDate}` : record.name,
    description: record.description,
    category: record.category,
    tags: record.tags,
    url: record.url,
    length: record.length,
    chapterCount: record.chapterCount,
    language: record.language,
    languageCategory: record.languageCategory,
    wordListRevision: record.wordListRevision,
  }
}
