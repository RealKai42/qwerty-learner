import useGameWordList from '../hooks/useGameWordList'
import { TypingGameContext } from '../index'
import type { TypingGameLevel } from '../utils/typingGame'
import TypingGame from '../utils/typingGame'
import { LEVELS } from '@/constants'
import { isOpenDarkModeAtom, typingGameConfigAtom } from '@/store'
import { useAtom, useAtomValue } from 'jotai'
import { useContext, useEffect, useRef } from 'react'
import type React from 'react'

function getRandomWords(gameWords: string[]) {
  const maxStart = Math.max(0, gameWords.length - 50)
  const index = Math.floor(Math.random() * (maxStart + 1))
  return gameWords.slice(index, index + 50)
}

const GamePanel: React.FC = () => {
  const wordPanel = useRef(null)
  const { gameWords } = useGameWordList()
  const [{ life, level }, setGameConfig] = useAtom(typingGameConfigAtom)
  const isOpenDarkMode = useAtomValue(isOpenDarkModeAtom)
  const typingGameRef = useRef<TypingGame | null>(null)
  const { state, setState, targetWord } = useContext(TypingGameContext)

  function getFontStyle(isOpenDarkMode: boolean) {
    return isOpenDarkMode
      ? {
          font: '48px Menlo',
          fillStyle: '#f9fafb',
        }
      : {
          font: '48px Menlo',
          fillStyle: '#4b5563',
        }
  }

  useEffect(() => {
    switch (state) {
      case 'running':
        typingGameRef.current?.resume()
        break
      case 'paused':
        typingGameRef.current?.pause()
        break
      case 'init':
        typingGameRef.current?.init()
        break
    }
  }, [state, setState])

  useEffect(() => {
    if (!typingGameRef.current) {
      typingGameRef.current = new TypingGame(
        wordPanel.current,
        (LEVELS.indexOf(level) + 1) as TypingGameLevel,
        parseInt(life),
        getRandomWords(gameWords),
        setState,
        setGameConfig,
        getFontStyle(isOpenDarkMode),
      )
    }
  }, [level, life, gameWords, setGameConfig, isOpenDarkMode, setState])

  useEffect(() => {
    typingGameRef.current?.changeGameSetting({
      life: parseInt(life),
      level: (LEVELS.indexOf(level) + 1) as TypingGameLevel,
      words: getRandomWords(gameWords),
    })
  }, [life, level, gameWords])

  useEffect(() => {
    typingGameRef.current?.changeFontSetting(getFontStyle(isOpenDarkMode))
  }, [isOpenDarkMode])

  useEffect(() => {
    typingGameRef.current?.wipeOut(targetWord)
  }, [targetWord])

  return (
    <div className="flex h-full w-full flex-col items-start">
      <canvas id="wordPanel" ref={wordPanel} className="h-full w-full"></canvas>
    </div>
  )
}

export default GamePanel
