import type { WordUpdateAction } from '../InputHandler'
import InputHandler from '../InputHandler'
import WordSound from '../WordSound'
import Furigana from './Furigana'
import Letter from './Letter'
import type { LetterState } from './Letter'
import Notation from './Notation'
import { CheckInputResult, DefaultWordStateAdapter, FuriganaWordStateAdapter } from './adapters'
import style from './index.module.css'
import { EXPLICIT_SPACE } from '@/constants'
import useKeySounds from '@/hooks/useKeySounds'
import useNotationInfo from '@/pages/Typing/hooks/useNotationInfo'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import { currentDictInfoAtom, isIgnoreCaseAtom, isShowAnswerOnHoverAtom, isTextSelectableAtom, pronunciationIsOpenAtom } from '@/store'
import type { Word } from '@/typings'
import { getUtcStringForMixpanel, useMixPanelWordLogUploader } from '@/utils'
import { useSaveWordRecord } from '@/utils/db'
import type { LetterMistakes } from '@/utils/db/record'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useImmer } from 'use-immer'

export type WordState = {
  displayWord: string
  inputWord: string
  letterStates: LetterState[]
  isFinished: boolean
  // 是否出现输入错误
  hasWrong: boolean
  // 记录是否已经出现过输入错误
  hasMadeInputWrong: boolean
  // 用户输入错误的次数
  wrongCount: number
  startTime: string
  endTime: string
  inputCount: number
  correctCount: number
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

const initialWordState: WordState = {
  displayWord: '',
  inputWord: '',
  letterStates: [],
  isFinished: false,
  hasWrong: false,
  hasMadeInputWrong: false,
  wrongCount: 0,
  startTime: '',
  endTime: '',
  inputCount: 0,
  correctCount: 0,
  letterTimeArray: [],
  letterMistake: {},
}

export default function WordComponent({ word, onFinish }: { word: Word; onFinish: () => void }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const [wordState, setWordState] = useImmer<WordState>(structuredClone(initialWordState))

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const isIgnoreCase = useAtomValue(isIgnoreCaseAtom)
  const isShowAnswerOnHover = useAtomValue(isShowAnswerOnHoverAtom)
  const saveWordRecord = useSaveWordRecord()
  const wordLogUploader = useMixPanelWordLogUploader(state)
  const [playKeySound, playBeepSound, playHintSound] = useKeySounds()
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)
  const [isHoveringWord, setIsHoveringWord] = useState(false)
  const currentLanguage = useAtomValue(currentDictInfoAtom).language
  const isRomaji = currentLanguage === 'romaji'
  const notationInfo = useNotationInfo(isRomaji ? word.notation : null)
  const showNotation = state.isWordVisible && notationInfo
  const showFurigana = !state.isWordVisible && notationInfo
  const adapter = useMemo(() => (showFurigana ? new FuriganaWordStateAdapter(notationInfo) : new DefaultWordStateAdapter()), [showFurigana])

  useEffect(() => {
    // run only when word changes
    const displayWord = adapter.getDisplayWord(word)
    const newWordState = structuredClone(initialWordState)
    newWordState.displayWord = displayWord
    newWordState.letterStates = new Array(displayWord.length).fill('normal')
    newWordState.startTime = getUtcStringForMixpanel()
    setWordState(newWordState)
  }, [word, setWordState, state.isWordVisible])

  const updateInput = useCallback(
    (updateAction: WordUpdateAction) => {
      switch (updateAction.type) {
        case 'add':
          if (wordState.hasWrong) return

          if (updateAction.value === ' ') {
            updateAction.event.preventDefault()
            setWordState((state) => {
              state.inputWord = state.inputWord + EXPLICIT_SPACE
            })
          } else {
            setWordState((state) => {
              state.inputWord = state.inputWord + updateAction.value
            })
          }
          break

        default:
          console.warn('unknown update type', updateAction)
      }
    },
    [wordState.hasWrong, setWordState],
  )

  const handleHoverWord = useCallback((checked: boolean) => {
    setIsHoveringWord(checked)
  }, [])

  useEffect(() => {
    const [result, letterIndex] = adapter.checkInput(wordState, isIgnoreCase)
    if (result == CheckInputResult.Noop) {
      return
    }
    switch (result) {
      case CheckInputResult.Correct:
      case CheckInputResult.Complete:
        // 输入正确时
        setWordState((state) => {
          state.letterTimeArray.push(Date.now())
          state.correctCount += 1
        })
        if (result == CheckInputResult.Complete) {
          // 完成输入时
          setWordState((state) => {
            state.letterStates[letterIndex] = 'correct'
            state.isFinished = true
            state.endTime = getUtcStringForMixpanel()
          })
          playHintSound()
        } else {
          setWordState((state) => {
            state.letterStates[letterIndex] = 'correct'
          })
          playKeySound()
        }
        dispatch({ type: TypingStateActionType.INCREASE_CORRECT_COUNT })
        break
      case CheckInputResult.Incorrect:
        playBeepSound()

        setWordState((state) => {
          state.letterStates[letterIndex] = 'wrong'
          state.hasWrong = true
          state.hasMadeInputWrong = true
          state.wrongCount += 1
          state.letterTimeArray = []
          if (state.letterMistake[letterIndex]) {
            state.letterMistake[letterIndex].push(state.inputWord.at(-1)!)
          } else {
            state.letterMistake[letterIndex] = [state.inputWord.at(-1)!]
          }
        })

        dispatch({ type: TypingStateActionType.INCREASE_WRONG_COUNT })
        dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD })
        break
      case CheckInputResult.Hold:
        playKeySound()
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.inputWord])

  useEffect(() => {
    if (wordState.hasWrong) {
      const timer = setTimeout(() => {
        setWordState((state) => {
          state.inputWord = ''
          state.letterStates = new Array(state.letterStates.length).fill('normal')
          state.hasWrong = false
        })
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [wordState.hasWrong, setWordState])

  useEffect(() => {
    if (wordState.isFinished) {
      if (!wordState.hasMadeInputWrong) {
        dispatch({ type: TypingStateActionType.REPORT_CORRECT_WORD })
      }

      dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: true })

      wordLogUploader({
        headword: word.name,
        timeStart: wordState.startTime,
        timeEnd: wordState.endTime,
        countInput: wordState.correctCount + wordState.wrongCount,
        countCorrect: wordState.correctCount,
        countTypo: wordState.wrongCount,
      })
      saveWordRecord({
        word: word.name,
        wrongCount: wordState.wrongCount,
        letterTimeArray: wordState.letterTimeArray,
        letterMistake: wordState.letterMistake,
      })

      onFinish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.isFinished])

  useEffect(() => {
    if (wordState.wrongCount >= 4) {
      dispatch({ type: TypingStateActionType.SET_IS_SKIP, payload: true })
    }
  }, [wordState.wrongCount, dispatch])
  return (
    <>
      <InputHandler updateInput={updateInput} />
      <div className="flex flex-col justify-center pb-1 pt-4">
        {showNotation && <Notation key={word.notation} infos={notationInfo} />}
        <div className="relative">
          <div
            onMouseEnter={() => handleHoverWord(true)}
            onMouseLeave={() => handleHoverWord(false)}
            className={`flex items-center ${isTextSelectable && 'select-all'} justify-center ${wordState.hasWrong ? style.wrong : ''}`}
          >
            {showFurigana ? (
              <Furigana infos={notationInfo} letterStates={wordState.letterStates} />
            ) : (
              wordState.displayWord.split('').map((t, index) => {
                return (
                  <Letter
                    key={`${index}-${t}`}
                    letter={t}
                    visible={wordState.letterStates[index] === 'correct' || (isShowAnswerOnHover && isHoveringWord) || state.isWordVisible}
                    state={wordState.letterStates[index]}
                  />
                )
              })
            )}
          </div>
          {pronunciationIsOpen && <WordSound word={word.name} inputWord={wordState.inputWord} className="h-10 w-10" />}
        </div>
      </div>
    </>
  )
}
