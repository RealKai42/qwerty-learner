import atomForConfig from './atomForConfig'
import { reviewInfoAtom } from './reviewInfoAtom'
import { DISMISS_START_CARD_DATE_KEY, defaultFontSizeConfig } from '@/constants'
import { idDictionaryMap } from '@/resources/dictionary'
import { foreignFontResources, translateFontResources } from '@/resources/fontResource'
import { correctSoundResources, keySoundResources, wrongSoundResources } from '@/resources/soundResource'
import type { Dictionary, LoopWordTimesOption, PhoneticType, PronunciationType, WordDictationOpenBy, WordDictationType } from '@/typings'
import type { ReviewRecord } from '@/utils/db/record'
import { IS_MAC_OS } from '@/utils/platform'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const currentDictIdAtom = atomWithStorage('currentDict', 'cet4')
export const currentDictInfoAtom = atom<Dictionary>((get) => {
  const id = get(currentDictIdAtom)
  let dict = idDictionaryMap[id]
  // 如果 dict 不存在，则返回 cet4. Typing 中会检查 DictId 是否存在，如果不存在则会重置为 cet4
  if (!dict) {
    dict = idDictionaryMap.cet4
  }
  return dict
})

export const currentChapterAtom = atomWithStorage('currentChapter', 0)

export const loopWordConfigAtom = atomForConfig<{ times: LoopWordTimesOption }>('loopWordConfig', {
  times: 1,
})

export const keySoundsConfigAtom = atomForConfig('keySoundsConfig', {
  isOpen: true,
  isOpenClickSound: true,
  volume: 1,
  resource: keySoundResources[0],
})

export const hintSoundsConfigAtom = atomForConfig('hintSoundsConfig', {
  isOpen: true,
  volume: 1,
  isOpenWrongSound: true,
  isOpenCorrectSound: true,
  wrongResource: wrongSoundResources[0],
  correctResource: correctSoundResources[0],
})

export const pronunciationConfigAtom = atomForConfig('pronunciation', {
  isOpen: true,
  volume: 1,
  type: 'us' as PronunciationType,
  name: '美音',
  isLoop: false,
  isTransRead: false,
  transVolume: 1,
  rate: 1,
})

export const fontSizeConfigAtom = atomForConfig('fontsize', defaultFontSizeConfig)

export const foreignFontAtom = atom((get) => get(fontSizeConfigAtom).foreignFont)

export const foreignFontConfigAtom = atomForConfig('foreignFontConfig', {
  resource: foreignFontResources[0],
})

export const translateFontConfigAtom = atomForConfig('translateFontConfig', {
  resource: translateFontResources[0],
})

export const pronunciationIsOpenAtom = atom((get) => get(pronunciationConfigAtom).isOpen)

export const pronunciationIsTransReadAtom = atom((get) => get(pronunciationConfigAtom).isTransRead)

export const randomConfigAtom = atomForConfig('randomConfig', {
  isOpen: false,
})

export const isShowPrevAndNextWordAtom = atomWithStorage('isShowPrevAndNextWord', true)

export const typingShortcutConfigAtom = atomForConfig('typingShortcutConfig', {
  prevWord: 'arrowleft',
  nextWord: 'arrowright',
  favoriteCurrent: IS_MAC_OS ? 'meta+shift+l' : 'ctrl+shift+l',
  favoritePrev: IS_MAC_OS ? 'meta+shift+arrowleft' : 'ctrl+shift+arrowleft',
  favoriteNext: IS_MAC_OS ? 'meta+shift+arrowright' : 'ctrl+shift+arrowright',
  pronunciation: IS_MAC_OS ? 'meta+j' : 'ctrl+j',
})

export const isIgnoreCaseAtom = atomWithStorage('isIgnoreCase', true)

export const isSkipParenthesesAtom = atomWithStorage('isSkipParentheses', false)

export const isShowAnswerOnHoverAtom = atomWithStorage('isShowAnswerOnHover', true)

export const isTextSelectableAtom = atomWithStorage('isTextSelectable', false)

export const reviewModeInfoAtom = reviewInfoAtom({
  isReviewMode: false,
  reviewRecord: undefined as ReviewRecord | undefined,
})
export const isReviewModeAtom = atom((get) => get(reviewModeInfoAtom).isReviewMode)

export const phoneticConfigAtom = atomForConfig('phoneticConfig', {
  isOpen: true,
  type: 'us' as PhoneticType,
})

export const darkModeFollowSystemAtom = atomWithStorage('darkModeFollowSystem', true)

export const systemDarkModeAtom = atom(window.matchMedia('(prefers-color-scheme: dark)').matches)

export const isOpenDarkModeAtom = atom(
  (get) => {
    if (get(darkModeFollowSystemAtom)) {
      return get(systemDarkModeAtom)
    }
    return get(isOpenDarkModeManualAtom)
  },
  (get, set, newValue: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof newValue === 'function' ? newValue(get(isOpenDarkModeAtom)) : newValue
    set(darkModeFollowSystemAtom, false)
    set(isOpenDarkModeManualAtom, resolved)
  },
)

const isOpenDarkModeManualAtom = atomWithStorage('isOpenDarkModeAtom', window.matchMedia('(prefers-color-scheme: dark)').matches)

export const isShowSkipAtom = atom(false)

export const isInDevModeAtom = atom(false)

export const wordDictationConfigAtom = atomForConfig('wordDictationConfig', {
  isOpen: false,
  type: 'hideAll' as WordDictationType,
  openBy: 'auto' as WordDictationOpenBy,
})

export const dismissStartCardDateAtom = atomWithStorage<Date | null>(DISMISS_START_CARD_DATE_KEY, null)

export { webdavConfigAtom, webdavConfigReadyAtom } from './webdavConfigAtom'

/** Tracks the last auto-backup error message (null = no error) */
export const webdavBackupErrorAtom = atom<string | null>(null)

export const languageAtom = atomWithStorage('i18nextLng', 'zh')

// for dev test
//   dismissStartCardDateAtom = atom<Date | null>(new Date())
