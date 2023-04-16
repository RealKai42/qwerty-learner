import dayjs from 'dayjs'
import { InfoPanelType } from '@/typings'
import mixpanel from 'mixpanel-browser'
import { PronunciationType } from '@/typings'
import { TypingState } from '@/pages/Typing/store'
import { useAtomValue } from 'jotai'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isLoopSingleWordAtom,
  isOpenDarkModeAtom,
  keySoundsConfigAtom,
  phoneticConfigAtom,
  pronunciationConfigAtom,
  randomConfigAtom,
} from '@/store'
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

export type WordLog = {
  headword: string
  timeStart: string
  timeEnd: string
  countInput: number
  countCorrect: number
  countTypo: number
}

export type WordLogUpload = WordLog &
  ModeInfo & {
    order: number
    chapter: string
    wordlist: string
    isLoopSingleWord: boolean
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

export function useMixPanelLogUploader() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const { name: dictName } = useAtomValue(currentDictInfoAtom)
  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const isLoopSingleWord = useAtomValue(isLoopSingleWordAtom)

  const wordLogUploader = useCallback(
    (wordLog: WordLog, typingState: TypingState) => {
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
        enabledSingleWordLoop: isLoopSingleWord,
        isLoopSingleWord,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }
      mixpanel.track('Word', props)
    },
    [
      currentChapter,
      dictName,
      isDarkMode,
      isLoopSingleWord,
      keySoundsConfig.isOpen,
      phoneticConfig.isOpen,
      pronunciationConfig.isOpen,
      pronunciationConfig.type,
      randomConfig.isOpen,
    ],
  )

  const chapterLogUploader = useCallback(
    (typingState: TypingState) => {
      const props: ChapterLogUpload = {
        timeEnd: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
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
        enabledSingleWordLoop: isLoopSingleWord,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }
      mixpanel.track('Chapter', props)
    },
    [
      currentChapter,
      dictName,
      isDarkMode,
      isLoopSingleWord,
      keySoundsConfig.isOpen,
      phoneticConfig.isOpen,
      pronunciationConfig.isOpen,
      pronunciationConfig.type,
      randomConfig.isOpen,
    ],
  )

  return [wordLogUploader, chapterLogUploader] as const
}
