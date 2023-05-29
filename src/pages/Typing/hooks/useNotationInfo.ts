import { isKanji } from '@/utils/kana'
import { useMemo } from 'react'

export type NotationType = 'furigana'

export type NotationInfo = {
  word: string
  phonetic?: string
}

export default function useNotationInfo(notation: string | null | undefined, type: NotationType = 'furigana'): NotationInfo[] {
  return useMemo(() => {
    if (!notation) {
      return []
    }
    const re = /(.+?)[([](.+?)[)\]]/g
    let match: any
    let start = 0
    const ret = []
    while ((match = re.exec(notation))) {
      const [fullMatch, , phonetic] = match
      let word = match[1]
      if (match.index > start) {
        ret.push({ word: notation.substring(start, match.index), phonetic: '' })
      }
      if (type == 'furigana') {
        let kanjiStart = 0
        for (let i = 0; i < word.length; i++) {
          if (!isKanji(word[i])) {
            kanjiStart += 1
          } else if (kanjiStart > 0) {
            ret.push({
              word: word.substring(0, i),
              phonetic: ' ',
            })
            word = word.substring(i)
            break
          }
        }
      }
      ret.push({
        word,
        phonetic,
      })
      start = match.index + fullMatch.length
    }
    if (start < notation.length) {
      ret.push({
        word: notation.substring(start),
        phonetic: '',
      })
    }
    return ret
  }, [notation])
}
