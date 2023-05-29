import type { LetterState } from './Letter'
import type { NotationInfo } from '@/pages/Typing/hooks/useNotationInfo'
import { isOpenDarkModeAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import React from 'react'
import colors from 'tailwindcss/colors'

type FuriganaProps = {
  infos: NotationInfo[]
  letterStates: LetterState[]
}

const stateClassNameMap: Record<LetterState, string> = {
  normal: 'text-gray-600 dark:text-gray-50',
  correct: 'text-green-600 dark:text-green-400',
  wrong: 'text-red-600 dark:text-red-400',
}

function generateKanaOffset(infos: NotationInfo[]) {
  const result = new Array(infos.length).fill(0)
  for (let i = 0; i < infos.length - 1; i++) {
    const { word, phonetic } = infos[i]
    const length = Math.max(word.length, phonetic?.trim()?.length ?? 0)
    result[i + 1] = result[i] + length
  }
  return result
}

function generateWordBackgroundStyle(
  word: string,
  phonetic: string | undefined,
  letterStates: LetterState[],
  offset: number,
  isDarkMode: boolean,
) {
  const totalLength = Math.max(word.length, phonetic?.trim()?.length ?? 0)
  let correctCount = 0
  let counterWrong = false
  for (let i = 0; i < totalLength; i++) {
    const state = letterStates[offset + i]
    if (state === 'correct') {
      correctCount++
    } else {
      if (state === 'wrong') {
        counterWrong = true
      }
      break
    }
  }
  const percent = Math.floor((correctCount / totalLength) * 100) + '%'
  if (counterWrong) {
    return `linear-gradient(to right, ${isDarkMode ? colors.red[400] : colors.red[600]} ${percent}, ${
      isDarkMode ? colors.gray[50] : colors.gray[900]
    } ${percent})`
  } else {
    return `linear-gradient(to right, ${isDarkMode ? colors.green[400] : colors.green[600]} ${percent}, ${
      isDarkMode ? colors.gray[50] : colors.gray[900]
    } ${percent})`
  }
}

function Text({ ch, state }: { ch: string; state: LetterState }) {
  return <span className={stateClassNameMap[state]}>{ch}</span>
}

export default function Furigana({ infos, letterStates }: FuriganaProps) {
  const kanaOffset = useMemo(() => generateKanaOffset(infos), [infos])
  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  return (
    <div className="mx-auto flex h-20 items-end">
      <ruby className="mb-1 p-0 font-mono text-6xl text-transparent dark:text-opacity-80">
        {infos.map(({ word, phonetic }, index) => (
          <React.Fragment key={`${index}`}>
            <span
              className={'bg-clip-text'}
              style={{ backgroundImage: generateWordBackgroundStyle(word, phonetic, letterStates, kanaOffset[index], isDarkMode) }}
            >
              {word}
            </span>
            <rt>
              {phonetic?.split('')?.map((ch, phoneticIndex) => (
                <Text key={`${index}-${phoneticIndex}`} ch={ch} state={letterStates[kanaOffset[index] + phoneticIndex]} />
              ))}
            </rt>
          </React.Fragment>
        ))}
      </ruby>
    </div>
  )
}
