import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { keySoundResources, wrongSoundResources, correctSoundResources } from '@/resources/soundResource'
import { PronunciationType, PhoneticType } from '@/typings'
import { idDictionaryMap } from '@/resources/dictionary'

export const currentDictIdAtom = atomWithStorage('currentDict', 'cet4')
export const currentDictInfoAtom = atom((get) => {
  const id = get(currentDictIdAtom)
  return idDictionaryMap[id] || null
})

export const currentChapterAtom = atomWithStorage('currentChapter', 1)

export const keySoundsConfigAtom = atomWithStorage('keySoundsConfig', {
  isOpen: true,
  isOpenClickSound: true,
  volume: 1,
  resource: keySoundResources[0],
})

export const hintSoundsConfigAtom = atomWithStorage('hintSoundsConfig', {
  isOpen: true,
  volume: 1,
  isOpenWrongSound: true,
  isOpenCorrectSound: true,
  wrongResource: wrongSoundResources[0],
  correctResource: correctSoundResources[0],
})

export const pronunciationConfigAtom = atomWithStorage('pronunciation', {
  isOpen: true,
  volume: 1,
  type: 'us' as PronunciationType,
  isLoop: false,
})
export const pronunciationIsOpenAtom = atom((get) => get(pronunciationConfigAtom).isOpen)

export const randomConfigAtom = atomWithStorage('randomConfig', {
  isOpen: false,
})

export const phoneticConfigAtom = atomWithStorage('phoneticConfig', {
  isOpen: true,
  type: 'us' as PhoneticType,
})

export const isOpenDarkModeAtom = atomWithStorage('isOpenDarkModeAtom', window.matchMedia('(prefers-color-scheme: dark)').matches)

export const isInDevModeAtom = atom(false)
