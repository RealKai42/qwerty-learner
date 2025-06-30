import Layout from '../../components/Layout'
import GamePanel from './components/GamePanel'
import SettingBar from './components/SettingBar'
import type { TypingGameState } from './utils/typingGame'
import { isChineseSymbol, isLegal } from '@/utils'
import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { Dispatch } from 'react'

export const TypingGameContext = createContext<{
  state: TypingGameState
  setState: Dispatch<React.SetStateAction<TypingGameState>>
  targetWord: string
}>({
  state: 'init',
  setState: () => undefined,
  targetWord: '',
})

const TypingGame: React.FC = () => {
  const [state, setState] = useState<TypingGameState>('init')
  const [targetWord, setTargetWord] = useState<string>('')
  const [inputWord, setInputWord] = useState<string>('')
  const inputRef = useRef<HTMLDivElement>(null)

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (state !== 'running') return

      const char = e.key

      if (isChineseSymbol(char)) {
        alert('您正在使用输入法，请关闭输入法。')
        return
      }

      if (char === 'Backspace') {
        setInputWord((word) => word.slice(0, word.length - 1))
      }
      if (inputWord && (char === 'Enter' || char === ' ')) {
        setTargetWord(inputWord)
        setInputWord('')
      }

      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey && char !== ' ') {
        inputRef.current?.focus()
        setInputWord((word) => (word += char))
      }
    },
    [inputWord, state],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown])

  function onPageBlur() {
    state === 'running' && setState('paused')
  }
  useEffect(() => {
    window.addEventListener('blur', onPageBlur)
    return () => {
      window.addEventListener('blur', onPageBlur)
    }
  })

  useEffect(() => setInputWord(''), [state, setInputWord])

  return (
    <TypingGameContext.Provider
      value={{
        state,
        setState,
        targetWord,
      }}
    >
      <Layout>
        <div className="relative flex h-full w-full flex-col justify-center">
          <div className="relative h-full w-full">
            <GamePanel />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 transform bg-[#faf9ff] py-1  font-[Menlo] text-5xl text-gray-600 duration-0 dark:bg-[#111827] dark:text-gray-50 dark:text-opacity-80"
              ref={inputRef}
            >
              {inputWord}
            </div>
          </div>
          <div className="justify-items-center">
            <SettingBar />
          </div>
        </div>
      </Layout>
    </TypingGameContext.Provider>
  )
}

export default TypingGame
