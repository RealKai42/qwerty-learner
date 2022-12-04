import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import Letter, { LetterState } from './Letter'
import { isLegal, isChineseSymbol } from '../../utils/utils'
import useSounds from 'hooks/useSounds'
import style from './index.module.css'
import WordSound from 'components/WordSound'
import { useAppState } from '../../store/AppState'

const EXPLICIT_SPACE = '␣'

export type WordDict = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

const Word: React.FC<WordProps> = ({ word = 'defaultWord', wordDict = { trans: [] }, onFinish, isStart, isLoop, wordVisible = true }) => {
  const originWord = word

  word = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
  word = word.replace(new RegExp('…', 'g'), '..')

  const [inputWord, setInputWord] = useState('')
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()
  const { pronunciation } = useAppState()

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
    if (isStart && (!isFinish || isLoop)) {
      setIsFinish(false)
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown, isLoop])

  useEffect(() => {
    if (isFinish) {
      playHintSound()
      setInputWord('')
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
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [hasWrong, isFinish, playBeepSound])

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
        setHasWrong(true)
        break
      }
    }

    if (!hasWrong && inputWordLength >= wordLength) {
      setIsFinish(true)
    }
    setStatesList(statesList)
  }, [inputWord, word])

  const playWordSound = pronunciation !== false
  const pronWord = () => {
    if (pronunciation !== 'jap') {
      return originWord
    }
    const japWord = wordDict?.trans[0].split('--')[1]
    return japWord === undefined ? originWord : japWord
  }

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
        </div>
        {playWordSound && <WordSound word={pronWord()} inputWord={inputWord} className={`${style['word-sound']}`} />}
      </div>
    </div>
  )
}

export type WordProps = {
  word: string
  wordDict: WordDict
  onFinish: Function
  isStart: boolean
  wordVisible: boolean
  isLoop: boolean
}
export default Word
