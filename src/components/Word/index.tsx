import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import Letter, { LetterState } from './Letter'
import { isLegal, isChineseSymbol } from '../../utils/utils'
import useSounds from 'hooks/useSounds'
import { values } from 'lodash'

const Word: React.FC<WordProps> = ({
  word = 'defaultWord',
  onFinish,
  isStart,
  wordVisible = true,
  enableBackspace = false,
  enableBlocking = false,
}) => {
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
    // 输入长度大于 word 时只取 word 长度部分的 inputWord
    if (inputWord.length > word.length) {
      setInputWord((value) => value.substr(0, value.length - 1))
    }
  }, [inputWord])

  useEffect(() => {
    if (isFinish) {
      playHintSound()
      onFinish()
    }
  }, [isFinish, playHintSound])

  useEffect(() => {
    console.log(statesList[statesList.length - 1])
    if (statesList[statesList.length - 1] === 'wrong') {
      playBeepSound()
    }
  }, [statesList, playBeepSound])

  useEffect(() => {
    console.log(statesList)
    if (enableBackspace && enableBlocking) {
      for (let inputState of statesList) {
        if (inputState === 'wrong') {
          setInputWord((values) => values.substr(0, statesList.indexOf(inputState)) + '"')
        }
      }
    }
  }, [statesList])

  useLayoutEffect(() => {
    let hasWrong = false,
      wordLength = word.length,
      inputWordLength = inputWord.length,
      _inputWord = inputWord
    const statesList: LetterState[] = []

    for (let i = 0; i < wordLength && i < inputWordLength; i++) {
      if (word[i] === _inputWord[i] || (_inputWord[i] === '"' && word[i] === _inputWord[i + 1])) {
        statesList.push('correct')
        if (word[i] === _inputWord[i + 1] && _inputWord[i] === '"') {
          if (_inputWord.length - 1 < word.length) {
            hasWrong = true
          }
          _inputWord = _inputWord.substr(0, i) + _inputWord[i + 1]
          setInputWord(_inputWord)
          break
        }
      } else {
        hasWrong = true
        statesList.push('wrong')
        if (!enableBackspace) {
          setInputWord('')
          break
        }
      }
    }

    if (!hasWrong && inputWordLength >= wordLength) {
      setIsFinish(true)
    }
    setStatesList(statesList)
  }, [inputWord, word, playBeepSound])

  return (
    <div className="pt-4 pb-1 flex items-center justify-center">
      {word.split('').map((t, index) => {
        return (
          <Letter
            key={`${index}-${t}`}
            visible={statesList[index] === 'correct' ? true : wordVisible}
            letter={t}
            state={statesList[index]}
          />
        )
      })}
    </div>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  isStart: boolean
  wordVisible: boolean
  enableBackspace?: boolean
  enableBlocking?: boolean
}
export default Word

/**
 * Warning: Can't perform a React state update on an unmounted component.
 * 为 use-sound 未解决的 bug
 */
