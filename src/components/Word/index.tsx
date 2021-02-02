import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import Letter, { LetterState } from '../Letter'
import { isLegal, isChineseSymbol } from '../../utils/utils'
import useSounds from 'hooks/useSounds'

const Word: React.FC<WordProps> = ({ word = 'defaultWord', onFinish, isStart, wordVisible = true }) => {
  word = word.replaceAll(' ', '_')
  const [inputWord, setInputWord] = useState('')
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()

  const onKeydown = useCallback(
    (e) => {
      const char = e.key
      if (char === ' ') {
        // 防止用户惯性按空格导致页面跳动
        e.preventDefault()
      }
      if (isChineseSymbol(char)) {
        alert('您正在使用中文输入法输入，请关闭输入法')
      }
      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        setInputWord((value) => (value += char))
        playKeySound()
      } else if (char === 'Backspace') setInputWord((value) => value.substr(0, value.length - 1))
    },
    [playKeySound],
  )

  useEffect(() => {
    if (isStart && !isFinish) window.addEventListener('keydown', onKeydown)

    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown])

  useEffect(() => {
    if (isFinish) {
      playHintSound()
      onFinish()
    }
  }, [isFinish, playHintSound])

  useEffect(() => {
    if (hasWrong) {
      playBeepSound()
      setHasWrong(false)
    }
  }, [hasWrong, playBeepSound])

  useLayoutEffect(() => {
    let hasWrong = false,
      wordLength = word.length,
      inputWordLength = inputWord.length
    const statesList: LetterState[] = []

    for (let i = 0; i < wordLength && i < inputWordLength; i++) {
      if (word[i] === inputWord[i]) {
        statesList.push('correct')
      } else {
        hasWrong = true
        statesList.push('wrong')
        setInputWord('')
        setHasWrong(true)
        break
      }
    }

    if (!hasWrong && inputWordLength >= wordLength) {
      setIsFinish(true)
    }
    setStatesList(statesList)
  }, [inputWord, word])

  return (
    <div className="py-4">
      {word.split('').map((t, index) => {
        return <Letter key={`${index}-${t}`} visible={wordVisible} letter={t} state={statesList[index]} />
      })}
    </div>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  isStart: boolean
  wordVisible: boolean
}
export default Word

/**
 * Warning: Can't perform a React state update on an unmounted component.
 * 为 use-sound 未解决的 bug
 */
