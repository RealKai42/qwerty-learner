import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import Letter, { LetterState } from './Letter'
import { isLegal, isChineseSymbol } from '../../utils/utils'
import useSounds from 'hooks/useSounds'
import style from './index.module.css'
import WordSound from 'components/WordSound'
import { useAppState, useAutoMode } from '../../store/AppState'

const EXPLICIT_SPACE = '␣'

const Word: React.FC<WordProps> = ({ word = 'defaultWord', onFinish, addSpeedCorrectCount, isStart, wordVisible = true }) => {
  const originWord = word

  word = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
  word = word.replace(new RegExp('…', 'g'), '..')

  const [inputWord, setInputWord] = useState('')
  const [oldInputLength, setOldInputLength] = useState<number>(0)
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [correctWordCount, setCorrectWordCount] = useState<number>(0)
  const [wrongWordCount, setWrongWordCount] = useState<number>(0)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()
  const { pronunciation } = useAppState()
  const [isAuto] = useAutoMode()
  const onKeydown = useCallback(
    (e) => {
      const char = e.key
      if (char === ' ') {
        // 防止用户惯性按空格导致页面跳动
        e.preventDefault()
        setInputWord((value) => (value += EXPLICIT_SPACE))
        playKeySound()
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
    if (!isStart || isFinish) window.removeEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown])

  useEffect(() => {
    if (isFinish) {
      playHintSound()

      onFinish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinish, hasWrong, playHintSound])

  useEffect(() => {
    if (hasWrong) {
      playBeepSound()
      const timer = setTimeout(() => {
        setInputWord('')
        setHasWrong(false)
        if (!isAuto) {
          setWrongWordCount((wrongCount) => wrongCount + 1)
        }
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line
  }, [hasWrong])

  useLayoutEffect(() => {
    let wordLength = word.length,
      hasWrong = false,
      inputWordLength = inputWord.length
    const statesList: LetterState[] = []

    for (let i = 0; i < wordLength && i < inputWordLength; i++) {
      if (word[i] === inputWord[i]) {
        statesList.push('correct')
      } else {
        hasWrong = true
        statesList.push('wrong')
        setHasWrong(true)
        break
      }
    }
    if (!hasWrong && inputWordLength > oldInputLength) {
      addSpeedCorrectCount(1)
      setOldInputLength(inputWordLength)
    }
    setStatesList(statesList)
    // eslint-disable-next-line
  }, [inputWord, word])

  useEffect(() => {
    if (!hasWrong && inputWord.length >= word.length) {
      if (isAuto) {
        setIsFinish(true)
      } else {
        let timer = setTimeout(() => {
          setInputWord('')
          setOldInputLength(0)
          if (!isAuto) {
            setCorrectWordCount((correctCount) => correctCount + 1)
          }
        }, 100)
        return () => {
          clearTimeout(timer)
        }
      }
    }
    // eslint-disable-next-line
  }, [inputWord])

  const playWordSound = pronunciation !== false

  return (
    <div className="flex justify-center pt-4 pb-1">
      <div className="relative">
        <div className={`flex items-center justify-center ${hasWrong ? style.wrong : ''}`}>
          {/* {console.log(inputWord, word)} */}
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
          <div>
            <p className={'align-super text-indigo-400'}>{correctWordCount > 0 && correctWordCount}</p>
            <p className={'align-sub   text-red-400'}>{wrongWordCount > 0 && wrongWordCount}</p>
          </div>
        </div>
        {playWordSound && <WordSound word={originWord} inputWord={inputWord} className={`${style['word-sound']}`} />}
      </div>
    </div>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  addSpeedCorrectCount: Function
  isStart: boolean
  wordVisible: boolean
}
export default Word
