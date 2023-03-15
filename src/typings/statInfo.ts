import { PronunciationType } from '@/typings'

export type WordStat = {
  headword: string
  timeStart: string
  timeEnd: string
  countInput: number
  countCorrect: number
  countTypo: number
}

export type ModeInfo = {
  modeDictation: boolean
  modeDark: boolean
  modeShuffle: boolean

  enabledKeyboardSound: boolean
  enabledPhotonicsSymbol: boolean

  pronunciationAuto: boolean
  pronunciationOption: PronunciationType | 'none'
}

export type WordStatUpload = WordStat &
  ModeInfo & {
    order: number
    chapter: string
    wordlist: string
  }

export type ChapterStatUpload = ModeInfo & {
  chapter: string
  wordlist: string
  timeEnd: string
  duration: number
  countInput: number
  countCorrect: number
  countTypo: number
}
