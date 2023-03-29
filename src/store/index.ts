import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { keySoundResources, wrongSoundResources, correctSoundResources } from '@/resources/soundResource'
import { PronunciationType, PhoneticType, Dictionary, InfoPanelState } from '@/typings'
import { idDictionaryMap } from '@/resources/dictionary'
import { CHAPTER_LENGTH, DISMISS_START_CARD_DATE_KEY } from '@/constants'

export const currentDictIdAtom = atomWithStorage('currentDict', 'cet4')
export const currentDictInfoAtom = atom<Dictionary>((get) => {
  const id = get(currentDictIdAtom)
  const dict = idDictionaryMap[id]
  const dictionary = { ...dict, chapterCount: Math.ceil(dict.length / CHAPTER_LENGTH) }
  return dictionary || null
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

export const isShowSkipAtom = atom(false)

export const isInDevModeAtom = atom(false)

export const infoPanelStateAtom = atom<InfoPanelState>({
  donate: false,
  vsc: false,
  community: false,
})

export const dismissStartCardDateAtom = atomWithStorage<Date | null>(DISMISS_START_CARD_DATE_KEY, null)

// for dev test
//   dismissStartCardDateAtom = atom<Date | null>(new Date())
