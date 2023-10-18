import type { TypingState } from '@/pages/Typing/store/type'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isOpenDarkModeAtom,
  keySoundsConfigAtom,
  phoneticConfigAtom,
  pronunciationConfigAtom,
  randomConfigAtom,
} from '@/store'
import type { InfoPanelType } from '@/typings'
import type { PronunciationType } from '@/typings'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback } from 'react'

export type starAction = 'star' | 'dismiss'

export function recordStarAction(action: starAction) {
  const props = {
    action,
  }
  mixpanel.track('star', props)
}

export type openInfoPanelLocation = 'footer' | 'resultScreen'
export function recordOpenInfoPanelAction(type: InfoPanelType, location: openInfoPanelLocation) {
  const props = {
    type,
    location,
  }
  mixpanel.track('openInfoPanel', props)
}

export type shareType = 'open' | 'download'
export function recordShareAction(type: shareType) {
  mixpanel.track('share', { type })
}

export type analysisType = 'open'
export function recordAnalysisAction(type: analysisType) {
  const props = {
    type,
  }

  mixpanel.track('analysis', props)
}

export type errorBookType = 'open' | 'detail'
export function recordErrorBookAction(type: errorBookType) {
  const props = {
    type,
  }

  mixpanel.track('error-book', props)
}

export type donateCardInfo = {
  type: 'donate' | 'dismiss'
  chapterNumber: number
  wordNumber: number
  sumWrongCount: number
  dayFromFirstWord: number
  dayFromQwerty: number
  amount: number
}

export function reportDonateCard(info: donateCardInfo) {
  const props = {
    ...info,
  }

  mixpanel.track('donate-card', props)
}

/**
 * mixpanel 单词和章节统计事件
 */
export type ModeInfo = {
  modeDictation: boolean
  modeDark: boolean
  modeShuffle: boolean

  enabledKeyboardSound: boolean
  enabledPhotonicsSymbol: boolean
  enabledSingleWordLoop: boolean

  pronunciationAuto: boolean
  pronunciationOption: PronunciationType | 'none'
}

export type WordLogUpload = ModeInfo & {
  headword: string
  timeStart: string
  timeEnd: string
  countInput: number
  countCorrect: number
  countTypo: number
  order: number
  chapter: string
  wordlist: string
}

export type ChapterLogUpload = ModeInfo & {
  chapter: string
  wordlist: string
  timeEnd: string
  duration: number
  countInput: number
  countCorrect: number
  countTypo: number
}

export function useMixPanelWordLogUploader(typingState: TypingState) {
  const currentChapter = useAtomValue(currentChapterAtom)
  const { name: dictName } = useAtomValue(currentDictInfoAtom)
  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const randomConfig = useAtomValue(randomConfigAtom)

  const wordLogUploader = useCallback(
    (wordLog: { headword: string; timeStart: string; timeEnd: string; countInput: number; countCorrect: number; countTypo: number }) => {
      const props: WordLogUpload = {
        ...wordLog,
        order: typingState.chapterData.index + 1,
        chapter: (currentChapter + 1).toString(),
        wordlist: dictName,
        modeDictation: !typingState.isWordVisible,
        modeDark: isDarkMode,
        modeShuffle: randomConfig.isOpen,
        enabledKeyboardSound: keySoundsConfig.isOpen,
        enabledPhotonicsSymbol: phoneticConfig.isOpen,
        enabledSingleWordLoop: typingState.isLoopSingleWord,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }
      mixpanel.track('Word', props)
    },
    [
      typingState,
      currentChapter,
      dictName,
      isDarkMode,
      keySoundsConfig.isOpen,
      phoneticConfig.isOpen,
      pronunciationConfig.isOpen,
      pronunciationConfig.type,
      randomConfig.isOpen,
    ],
  )

  return wordLogUploader
}

export function useMixPanelChapterLogUploader(typingState: TypingState) {
  const currentChapter = useAtomValue(currentChapterAtom)
  const { name: dictName } = useAtomValue(currentDictInfoAtom)
  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const randomConfig = useAtomValue(randomConfigAtom)

  const chapterLogUploader = useCallback(() => {
    const props: ChapterLogUpload = {
      timeEnd: getUtcStringForMixpanel(),
      duration: typingState.timerData.time,
      countInput: typingState.chapterData.correctCount + typingState.chapterData.wrongCount,
      countTypo: typingState.chapterData.wrongCount,
      countCorrect: typingState.chapterData.correctCount,
      chapter: (currentChapter + 1).toString(),
      wordlist: dictName,
      modeDictation: !typingState.isWordVisible,
      modeDark: isDarkMode,
      modeShuffle: randomConfig.isOpen,
      enabledKeyboardSound: keySoundsConfig.isOpen,
      enabledPhotonicsSymbol: phoneticConfig.isOpen,
      enabledSingleWordLoop: typingState.isLoopSingleWord,
      pronunciationAuto: pronunciationConfig.isOpen,
      pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
    }
    mixpanel.track('Chapter', props)
  }, [
    typingState,
    currentChapter,
    dictName,
    isDarkMode,
    keySoundsConfig.isOpen,
    phoneticConfig.isOpen,
    pronunciationConfig.isOpen,
    pronunciationConfig.type,
    randomConfig.isOpen,
  ])
  return chapterLogUploader
}

export function recordDataAction({
  type,
  size,
  wordCount,
  chapterCount,
}: {
  type: 'export' | 'import'
  size: number
  wordCount: number
  chapterCount: number
}) {
  const props = {
    type,
    size,
    wordCount,
    chapterCount,
  }

  mixpanel.track('dataAction', props)
}

export function getUtcStringForMixpanel() {
  const now = new Date()
  const isoString = now.toISOString()
  const utcString = isoString.substring(0, 19).replace('T', ' ')

  return utcString
}
