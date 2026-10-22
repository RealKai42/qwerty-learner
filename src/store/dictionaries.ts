import { dictionaries, idDictionaryMap } from '@/resources/dictionary'
import type { Dictionary } from '@/typings'
import type { CustomDictionary } from '@/typings/memo'
import { atom } from 'jotai'

export const customDictionariesAtom = atom<Dictionary[]>([])
export const dictionariesReadyAtom = atom(false)
export const dictionariesErrorAtom = atom(false)
export const dictionariesAtom = atom((get) => [...get(customDictionariesAtom), ...dictionaries])
export const dictionaryMapAtom = atom((get) => ({
  ...idDictionaryMap,
  ...Object.fromEntries(get(customDictionariesAtom).map((dict) => [dict.id, dict])),
}))

export function dictionaryMetadata(record: CustomDictionary): Dictionary {
  return {
    id: record.id,
    name: record.name,
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
