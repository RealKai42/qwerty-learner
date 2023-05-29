import type { WordState } from '.'
import { EXPLICIT_SPACE } from '@/constants'
import type { NotationInfo } from '@/pages/Typing/hooks/useNotationInfo'
import type { Word } from '@/typings'
import { kanaToRomajiDict } from '@/utils/kana'

export enum CheckInputResult {
  Correct,
  Incorrect,
  Complete,
  Hold,
  Noop,
}

type MatchType = -1 | 0 | 1 | 2
type SourceType = 1 | 2

interface WordStateAdapter {
  getDisplayWord(word: Word): string
  checkInput(wordState: WordState, isIgnoreCase: boolean): [CheckInputResult, number]
}

export class DefaultWordStateAdapter implements WordStateAdapter {
  checkInput(wordState: WordState, isIgnoreCase = false): [CheckInputResult, number] {
    const inputLength = wordState.inputWord.length
    if (wordState.hasWrong || inputLength === 0 || wordState.displayWord.length === 0) {
      return [CheckInputResult.Noop, -1]
    }

    const inputChar = wordState.inputWord[inputLength - 1]
    const correctChar = wordState.displayWord[inputLength - 1]
    const cursorIndex = inputLength - 1

    let isEqual = false
    if (inputChar != undefined && correctChar != undefined) {
      isEqual = isIgnoreCase ? inputChar.toLowerCase() === correctChar.toLowerCase() : inputChar === correctChar
    }
    if (isEqual) {
      if (inputLength >= wordState.displayWord.length) {
        return [CheckInputResult.Complete, cursorIndex]
      }
      return [CheckInputResult.Correct, cursorIndex]
    } else {
      return [CheckInputResult.Incorrect, cursorIndex]
    }
  }
  getDisplayWord(word: Word): string {
    let displayWord = word.name.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
    displayWord = displayWord.replace(new RegExp('…', 'g'), '..')
    return displayWord
  }
}

export class FuriganaWordStateAdapter implements WordStateAdapter {
  private kana: string
  private romaji: [SourceType, string[]][]
  constructor(infos: NotationInfo[]) {
    this.kana = infos
      .map(({ word, phonetic }) => (phonetic && phonetic.trim().length > 0 ? phonetic : word))
      .join('')
      .replace(' ', '')
    this.romaji = []
    this.initRomaji()
  }

  private initRomaji() {
    let pnt = 0
    let r
    let ch
    const max = this.kana.length
    while (pnt < max) {
      if ((r = kanaToRomajiDict[this.kana.substring(pnt, pnt + 2)])) {
        const sourceType: SourceType = pnt + 2 <= this.kana.length ? 2 : 1
        this.romaji.push([sourceType, r])
        pnt += 2
      } else {
        r = kanaToRomajiDict[(ch = this.kana.substring(pnt, pnt + 1))]
        this.romaji.push([1, r ? r : [ch]])
        pnt += 1
      }
    }
  }

  checkInput(wordState: WordState, _isIgnoreCase = false): [CheckInputResult, number] {
    const inputWord = wordState.inputWord
    const inputLength = inputWord.length
    if (wordState.hasWrong || inputLength === 0 || wordState.displayWord.length === 0) {
      return [CheckInputResult.Noop, -1]
    }
    const romajiLength = this.romaji.length
    let romajiIndex = 0
    let inputIndex = 0
    let offset = 0
    let match: MatchType = -1
    let kanaIndex = 0
    const kanaLength = this.kana.length
    while (inputIndex < inputLength && romajiIndex < romajiLength) {
      const [sourceType, options] = this.romaji[romajiIndex]
      match = -1
      const innerIndex = inputIndex - offset
      for (let option of options) {
        if (option === 'っ' || option === 'ッ') {
          if (romajiIndex + 1 < romajiLength) {
            option = this.romaji[romajiIndex + 1][1][0][0]
          }
        }
        if (option.length > innerIndex && option[innerIndex] == inputWord[inputIndex]) {
          if (innerIndex == option.length - 1) {
            // 成功匹配一个假名
            match = 0
          } else if (sourceType == 2 && innerIndex == 0) {
            // 拗音的情况
            match = 1
          } else {
            match = 2
          }
          break
        }
      }
      if (match == -1) {
        return [CheckInputResult.Incorrect, kanaIndex]
      } else if (match == 0) {
        romajiIndex++
        offset = inputIndex + 1
      }
      if (match == 0 || match == 1) {
        kanaIndex++
      }
      inputIndex++
    }
    if (kanaIndex > kanaLength) {
      return [CheckInputResult.Incorrect, kanaLength - 1]
    }
    if (match == 1) {
      return [CheckInputResult.Correct, kanaIndex - 1]
    }
    if (match == 2) {
      return [CheckInputResult.Hold, kanaIndex]
    }
    if (kanaIndex == kanaLength) {
      return [CheckInputResult.Complete, kanaIndex - 1]
    }
    return [CheckInputResult.Correct, kanaIndex - 1]
  }

  getDisplayWord(_word: Word): string {
    return this.kana
  }
}
