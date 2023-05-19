import { isKanji } from '@/utils/kana'
import { useMemo } from 'react'

type NotationProps = {
  notation: string
}

type NotationInfo = {
  word: string
  phonetic?: string
}

export default function Notation({ notation }: NotationProps) {
  const infos: NotationInfo[] = useMemo(() => {
    const re = /(.+?)\((.+?)\)/g
    let match
    let start = 0
    const ret = []
    while ((match = re.exec(notation))) {
      console.log(match)
      if (match.index > start) {
        ret.push({ word: notation.substring(start, match.index) })
      }
      // todo 需要根据外部类型来处理，当前写死日语
      // 处理该情况：食(た)べ物(もの)
      let kanjiStart = 0
      for (let i = 0; i < match[1].length; i++) {
        if (!isKanji(match[1][i])) {
          kanjiStart += 1
        } else if (kanjiStart > 0) {
          ret.push({
            word: match[1].substring(0, i),
            phonetic: ' ',
          })
          match[1] = match[1].substring(i)
          break
        }
      }
      console.log(match[1])
      ret.push({
        word: match[1],
        phonetic: match[2],
      })
      start = match.index + match[0].length
    }
    if (start < notation.length) {
      ret.push({
        word: notation.substring(start),
      })
    }
    return ret
  }, [notation])
  return (
    <ruby className="mx-auto mb-1 p-0 font-mono text-5xl text-gray-800 dark:text-opacity-80">
      {infos.map((value) => (
        <>
          {value.word}
          {(value.phonetic ?? '').length > 0 && (
            <>
              <rp>{value.phonetic!.trim().length > 0 ? '(' : ''}</rp>
              <rt>{value.phonetic}</rt>
              <rp>{value.phonetic!.trim().length > 0 ? ')' : ''}</rp>
            </>
          )}
        </>
      ))}
    </ruby>
  )
}
