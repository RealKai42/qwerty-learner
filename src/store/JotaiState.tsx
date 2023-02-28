import { atom, Provider } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { dictionaries, Dictionary } from '@/resources/dictionary'

export type PronunciationType = 'us' | 'uk' | 'romaji' | 'zh' | 'ko' | 'jp' | false

export const soundAtom = atomWithStorage<boolean>('sound', true)

export const pronunciationAtom = atom<PronunciationType>('us')
//pronuncitation changes with selectedDictionary every time, so it's not stored in localStorage

export const selectedDictionaryAtom = atomWithStorage<Dictionary>('selectedDictionary', dictionaries[0])

export const selectedChapterAtom = atomWithStorage<number>('selectedChapter', 0)

export const randomAtom = atomWithStorage<boolean>('random', false)

export const phoneticAtom = atomWithStorage<boolean>('phonetic', false)

export const darkModeAtom = atomWithStorage<boolean>('darkMode', false)

export const soundLoopAtom = atomWithStorage<boolean>('soundLoop', false)

export const dictionariesAtom = atom<Dictionary[]>(dictionaries)
