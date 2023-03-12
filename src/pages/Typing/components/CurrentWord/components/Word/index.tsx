import { useMemo, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import Letter from './Letter'
import useSounds from '@/hooks/useSounds'
import { LetterState } from './Letter'
import { isChineseSymbol, isLegal } from '@/utils/utils'
import style from './index.module.css'
import WordSound from '../WordSound'

export type WordProps = {
  word: string
  onFinish: (everWrong: boolean) => void
  isStart: boolean
  wordVisible: boolean
}

const EXPLICIT_SPACE = '␣'

export default function Word({ word, isStart, onFinish, wordVisible }: WordProps) {
  const displayWord = useMemo(() => {
    let wordString = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
    wordString = wordString.replace(new RegExp('…', 'g'), '..')
    return wordString
  }, [word])

  const [inputWord, setInputWord] = useState('')
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [everWrong, setEverWrong] = useState(false)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()

  const onKeydown = useCallback((e: KeyboardEvent) => {
    const char = e.key
    if (char === ' ') {
      // 防止用户惯性按空格导致页面跳动
      e.preventDefault()
      setInputWord((value) => (value += EXPLICIT_SPACE))
    } else if (isChineseSymbol(char)) {
      alert('您正在使用中文输入法输入，请关闭输入法')
    } else if (char === 'Backspace') {
      setInputWord((value) => value.substr(0, value.length - 1))
    } else if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // todo: 是否需要引入 isLegal 判断
      setInputWord((value) => (value += char))
    }
  }, [])

  // useEffect when word change
  useEffect(() => {
    setEverWrong(false)
  }, [word])

  useEffect(() => {
    if (isStart && !isFinish) {
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStart])

  // when finished the word
  useEffect(() => {
    if (isFinish) {
      playHintSound()
      // reset state
      setInputWord('')
      setStatesList([])
      setIsFinish(false)
      setHasWrong(false)
      setEverWrong(false)

      onFinish(everWrong)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinish])

  // update words state
  useLayoutEffect(() => {
    let hasWrong = false
    const wordLength = word.length,
      inputWordLength = inputWord.length
    const statesList: LetterState[] = []

    for (let i = 0; i < wordLength && i < inputWordLength; i++) {
      if (word[i] === inputWord[i]) {
        statesList.push('correct')
        if (i === inputWordLength - 1) {
          playKeySound()
        }
      } else {
        hasWrong = true
        statesList.push('wrong')
        setHasWrong(true)
        setEverWrong(true)
        break
      }
    }

    if (!hasWrong && inputWordLength >= wordLength) {
      console.log('finish')
      setIsFinish(true)
    }
    setStatesList(statesList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputWord, word])

  // when has wrong
  useEffect(() => {
    if (hasWrong) {
      playBeepSound()
      const timer = setTimeout(() => {
        setInputWord('')
        setHasWrong(false)
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWrong])

  return (
    <div className="flex justify-center pt-4 pb-1">
      <div className="relative">
        <div className={`flex items-center justify-center ${hasWrong ? style.wrong : ''}`}>
          {displayWord.split('').map((t, index) => {
            return (
              <Letter
                key={`${index}-${t}`}
                letter={t}
                visible={statesList[index] === 'correct' ? true : wordVisible}
                state={statesList[index]}
              />
            )
          })}
        </div>
        <WordSound word={word} inputWord={inputWord} />
      </div>
    </div>
  )
}
