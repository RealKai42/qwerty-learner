import { useMemo, useState, useCallback, useEffect, useRef, useContext } from 'react'
import Letter from './Letter'
import useKeySounds from '@/hooks/useKeySounds'
import { LetterState } from './Letter'
import style from './index.module.css'
import WordSound from '../WordSound'
import { useAtomValue } from 'jotai'
import { pronunciationIsOpenAtom } from '@/store'
import { WordStat } from '@/typings'
import dayjs from 'dayjs'
import { EXPLICIT_SPACE } from '@/constants'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import InputHandler, { WordUpdateAction } from '../InputHandler'

const initialStatInfo = {
  headword: '',
  timeStart: '',
  timeEnd: '',
  countInput: 0,
  countCorrect: 0,
  countTypo: 0,
}

type WordState = {
  inputWord: string
  statesList: LetterState[]
  isFinish: boolean
  hasWrong: boolean
  wrongRepeat: number
}

const initialWordState: WordState = {
  inputWord: '',
  statesList: [],
  isFinish: false,
  hasWrong: false,
  wrongRepeat: 0,
}

export type WordProps = {
  word: string
  onFinish: (wordStat: WordStat) => void
}

export default function Word({ word, onFinish }: WordProps) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const [wordState, setWordState] = useState<WordState>(initialWordState)
  const wordStat = useRef<WordStat>(initialStatInfo)
  const wordVisible = state.isWordVisible

  const displayWord = useMemo(() => {
    // run only when word changes
    let wordString = word.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
    wordString = wordString.replace(new RegExp('…', 'g'), '..')
    setWordState(() => ({ ...initialWordState, statesList: new Array(wordString.length).fill('normal') }))
    wordStat.current = { ...initialStatInfo }
    wordStat.current.timeStart = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
    return wordString
  }, [word])

  const [playKeySound, playBeepSound, playHintSound] = useKeySounds()
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)

  const updateInput = useCallback(
    (updateAction: WordUpdateAction) => {
      switch (updateAction.type) {
        case 'add':
          if (wordState.hasWrong) {
            return
          }

          if (updateAction.value === ' ') {
            updateAction.event.preventDefault()
            setWordState((state) => ({
              ...state,
              inputWord: state.inputWord + EXPLICIT_SPACE,
            }))
          } else {
            setWordState((state) => ({
              ...state,
              inputWord: state.inputWord + updateAction.value,
            }))
          }

          break

        default:
          console.warn('unknown update type', updateAction)
      }
    },
    [wordState.hasWrong],
  )

  useEffect(() => {
    const inputLength = wordState.inputWord.length
    if (inputLength === 0) {
      return
    }

    const inputChar = wordState.inputWord[inputLength - 1]
    const correctChar = displayWord[inputLength - 1]
    if (inputChar === correctChar) {
      if (inputLength >= displayWord.length) {
        const isAllCorrect = wordState.statesList.slice(0, -1).every((t) => t === 'correct')
        if (isAllCorrect) {
          setWordState((state) => ({
            ...state,
            statesList: state.statesList.map((t, i) => (i === inputLength - 1 ? 'correct' : t)),
            isFinish: true,
          }))
          playHintSound()
        }
      } else {
        setWordState((state) => ({
          ...state,
          statesList: state.statesList.map((t, i) => (i === inputLength - 1 ? 'correct' : t)),
        }))
        playKeySound()
      }

      wordStat.current.countCorrect += 1
      dispatch({ type: TypingStateActionType.INCREASE_CORRECT_COUNT })
    } else {
      setWordState((state) => ({
        ...state,
        statesList: state.statesList.map((t, i) => (i === inputLength - 1 ? 'wrong' : t)),
        hasWrong: true,
      }))
      playBeepSound()
      dispatch({ type: TypingStateActionType.INCREASE_WRONG_COUNT })
      dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD })
      wordStat.current.countTypo += 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.inputWord, displayWord, dispatch])

  useEffect(() => {
    if (wordState.hasWrong) {
      setWordState((state) => ({
        ...state,
        wrongRepeat: state.wrongRepeat + 1,
      }))

      const timer = setTimeout(() => {
        setWordState((state) => ({
          ...state,
          inputWord: '',
          statesList: new Array(displayWord.length).fill('normal'),
          hasWrong: false,
        }))
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [wordState.hasWrong, displayWord.length])

  useEffect(() => {
    if (wordState.isFinish) {
      // prepare wordStat
      wordStat.current.timeEnd = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
      wordStat.current.headword = word
      wordStat.current.countInput = wordStat.current.countCorrect + wordStat.current.countTypo
      onFinish(wordStat.current)
    }
  }, [wordState.isFinish, word, onFinish])

  useEffect(() => {
    if (wordState.wrongRepeat >= 4) {
      dispatch({ type: TypingStateActionType.SET_IS_SKIP, payload: true })
    }
  }, [wordState.wrongRepeat, dispatch])

  return (
    <>
      <InputHandler updateInput={updateInput} />
      <div className="flex justify-center pb-1 pt-4">
        <div className="relative">
          <div className={`flex items-center justify-center ${wordState.hasWrong ? style.wrong : ''}`}>
            {displayWord.split('').map((t, index) => {
              return (
                <Letter
                  key={`${index}-${t}`}
                  letter={t}
                  visible={wordState.statesList[index] === 'correct' ? true : wordVisible}
                  state={wordState.statesList[index]}
                />
              )
            })}
          </div>
          {pronunciationIsOpen && <WordSound word={word} inputWord={wordState.inputWord} />}
        </div>
      </div>
    </>
  )
}
