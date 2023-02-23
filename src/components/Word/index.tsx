import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react'
import Letter, { LetterState } from './Letter'
import useSounds from '@/hooks/useSounds'
import style from './index.module.css'
import WordSound from '@/components/WordSound'
import { useAppState } from '../../store/AppState'
import { WordStat } from '@/utils/statInfo'
import dayjs from 'dayjs'
import { languageCategory } from '@/utils/utils'
import DIH from '../../pages/Typing/Input_handler/Direct_input_handler/index' //DirectInputHandler
import IIH from '../../pages/Typing/Input_handler/Indirect_input_handler/index' //IndirectInputHandler

const EXPLICIT_SPACE = '␣'

const initialStatInfo = {
  headword: '',
  timeStart: '',
  timeEnd: '',
  countInput: 0,
  countCorrect: 0,
  countTypo: 0,
}

const Word: React.FC<WordProps> = ({ language, word = 'defaultWord', onFinish, isStart, wordVisible = true }) => {
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

  /*   const onKeydown = useCallback(
    // 抽离时要改
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

        wordStat.current.countInput += 1
      } else if (char === 'Backspace') setInputWord((value) => value.substr(0, value.length - 1))
    },
    [playKeySound],
  ) */

  // useEffect when word change
  useEffect(() => {
    setEverWrong(false)
    wordStat.current = { ...initialStatInfo }
    wordStat.current.timeStart = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
  }, [word])

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

  return (
    <>
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
          {playWordSound && <WordSound word={originWord} inputWord={inputWord} className={`${style['word-sound']}`} />}
        </div>
      </div>
      {languageCategory.direct.includes(language) ? (
        <DIH isStart={isStart} isFinish={isFinish} setInputWord={setInputWord} playKeySound={playKeySound} />
      ) : (
        <IIH language={language} setInputWord={setInputWord} playKeySound={playKeySound} />
      )}
    </>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  isStart: boolean
  wordVisible: boolean
  language: string
}
export default Word
