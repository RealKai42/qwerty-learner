import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react'
import Letter, { LetterState } from './Letter'
import { isLegal, isChineseSymbol } from '../../utils/utils'
import useSounds from '@/hooks/useSounds'
import style from './index.module.css'
import WordSound from '@/components/WordSound'
import { useAppState } from '../../store/AppState'
import { WordStat } from '@/utils/statInfo'
import dayjs from 'dayjs'

const EXPLICIT_SPACE = '␣'

const initialStatInfo = {
  headword: '',
  timeStart: '',
  timeEnd: '',
  countInput: 0,
  countCorrect: 0,
  countTypo: 0,
}
export type WordDict = {
  japphone: string
}
const Word: React.FC<WordProps> = ({ word = 'defaultWord', wordDict = { japphone: [] }, onFinish, isStart, wordVisible = true }) => {
  const originWord = word

  word = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
  word = word.replace(new RegExp('…', 'g'), '..')

  const [inputWord, setInputWord] = useState('')
  const [statesList, setStatesList] = useState<LetterState[]>([])
  const [isFinish, setIsFinish] = useState(false)
  const [hasWrong, setHasWrong] = useState(false)
  const [everWrong, setEverWrong] = useState(false)
  const [playKeySound, playBeepSound, playHintSound] = useSounds()
  const { pronunciation } = useAppState()

  const wordStat = useRef<WordStat>(initialStatInfo)

  const onKeydown = useCallback((e) => {
    const char = e.key
    if (char === ' ') {
      // 防止用户惯性按空格导致页面跳动
      e.preventDefault()
      setInputWord((value) => (value += EXPLICIT_SPACE))
    }
    if (isChineseSymbol(char)) {
      alert('您正在使用中文输入法输入，请关闭输入法')
    }
    if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
      setInputWord((value) => (value += char))

      wordStat.current.countInput += 1
    } else if (char === 'Backspace') setInputWord((value) => value.substr(0, value.length - 1))
  }, [])

  // useEffect when word change
  useEffect(() => {
    setEverWrong(false)
    wordStat.current = { ...initialStatInfo }
    wordStat.current.timeStart = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
  }, [word])

  useEffect(() => {
    if (isStart && !isFinish) {
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown])

  // when finished the word
  useEffect(() => {
    if (isFinish) {
      // prepare wordStat
      wordStat.current.timeEnd = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
      wordStat.current.headword = originWord
      wordStat.current.countCorrect = wordStat.current.countInput - wordStat.current.countTypo

      playHintSound()
      setInputWord('')
      onFinish(everWrong, wordStat.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinish, hasWrong, playHintSound])

  // when has wrong
  useEffect(() => {
    if (hasWrong) {
      playBeepSound()
      wordStat.current.countTypo += 1
      const timer = setTimeout(() => {
        setInputWord('')
        setHasWrong(false)
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [hasWrong, playBeepSound])

  // update words state
  useLayoutEffect(() => {
    let hasWrong = false,
      wordLength = word.length,
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
      setIsFinish(true)
    }
    setStatesList(statesList)
  }, [inputWord, word])

  const playWordSound = pronunciation !== false
  const pronWord = () => {
    if (pronunciation !== 'jap') {
      return originWord
    }
    const japWord = wordDict?.japphone
    return japWord === undefined ? originWord : japWord
  }
  return (
    <div className="flex justify-center pt-4 pb-1">
      <div className="relative">
        <div className={`flex items-center justify-center ${hasWrong ? style.wrong : ''}`}>
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
}
export default Word
