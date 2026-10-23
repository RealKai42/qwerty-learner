import type { WordUpdateAction } from '../InputHandler'
import InputHandler from '../InputHandler'
import Letter from './Letter'
import Notation from './Notation'
import { TipAlert } from './TipAlert'
import style from './index.module.css'
import { initialWordState } from './type'
import type { WordState } from './type'
import Tooltip from '@/components/Tooltip'
import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { EXPLICIT_SPACE } from '@/constants'
import useKeySounds from '@/hooks/useKeySounds'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isIgnoreCaseAtom,
  isShowAnswerOnHoverAtom,
  isTextSelectableAtom,
  pronunciationIsOpenAtom,
  wordDictationConfigAtom,
} from '@/store'
import type { Word } from '@/typings'
import { CTRL, getUtcStringForMixpanel } from '@/utils'
import { useSaveWordRecord } from '@/utils/db'
import { normalizePracticeText, practiceContentType } from '@/utils/practice'
import { applyTextKey } from '@/utils/practice-input'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useImmer } from 'use-immer'

const vowelLetters = ['A', 'E', 'I', 'O', 'U']

export default function WordComponent({ word, onFinish }: { word: Word; onFinish: () => void }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const [wordState, setWordState] = useImmer<WordState>(structuredClone(initialWordState))

  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const isIgnoreCase = useAtomValue(isIgnoreCaseAtom)
  const isShowAnswerOnHover = useAtomValue(isShowAnswerOnHoverAtom)
  const saveWordRecord = useSaveWordRecord()
  // const wordLogUploader = useMixPanelWordLogUploader(state)
  const [playKeySound, playBeepSound, playHintSound] = useKeySounds()
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)
  const [isHoveringWord, setIsHoveringWord] = useState(false)
  const currentLanguage = useAtomValue(currentDictInfoAtom).language
  const currentLanguageCategory = useAtomValue(currentDictInfoAtom).languageCategory
  const currentChapter = useAtomValue(currentChapterAtom)
  const contentType = practiceContentType(word, currentLanguage)
  const isTextEntry = currentLanguage === 'en' && contentType !== 'word'
  const textState = useRef<WordState>(structuredClone(initialWordState))
  const textPanel = useRef<HTMLDivElement>(null)

  const [showTipAlert, setShowTipAlert] = useState(false)
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)

  useEffect(() => {
    // run only when word changes
    let headword = ''
    try {
      headword = (currentLanguage === 'en' ? normalizePracticeText(word.name) : word.name).replace(/ /g, EXPLICIT_SPACE)
    } catch (e) {
      console.error('word.name is not a string', word)
      headword = ''
    }

    const newWordState = structuredClone(initialWordState)
    newWordState.displayWord = headword
    newWordState.letterStates = new Array(headword.length).fill('normal')
    newWordState.startTime = getUtcStringForMixpanel()
    newWordState.randomLetterVisible = headword.split('').map(() => Math.random() > 0.4)
    textState.current = newWordState
    setWordState(newWordState)
  }, [word, currentLanguage, setWordState])

  useEffect(() => {
    if (isTextEntry) textPanel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [isTextEntry, wordState.inputWord.length, wordState.hasWrong])

  const updateInput = useCallback(
    (updateAction: WordUpdateAction) => {
      if (isTextEntry) {
        if (updateAction.type === 'composition') return
        if (updateAction.type === 'add' && updateAction.value.includes(' ')) updateAction.event.preventDefault()
        const keys =
          updateAction.type === 'delete'
            ? ['Backspace']
            : Array.from(updateAction.value.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/ /g, EXPLICIT_SPACE))
        for (const key of keys) {
          const { next, outcome } = applyTextKey(textState.current, key, textState.current.displayWord, isIgnoreCase, Date.now())
          textState.current = next
          if (outcome === 'correct') {
            dispatch({ type: TypingStateActionType.REPORT_CORRECT_WORD })
            if (next.isFinished) playHintSound()
            else playKeySound()
          } else if (outcome === 'wrong') {
            playBeepSound()
            dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD, payload: { letterMistake: { [next.inputWord.length - 1]: [key] } } })
          }
        }
        setWordState(textState.current)
        return
      }
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
    [wordState.hasWrong, setWordState, isTextEntry, isIgnoreCase, dispatch, playHintSound, playKeySound, playBeepSound],
  )

  const handleHoverWord = useCallback((checked: boolean) => {
    setIsHoveringWord(checked)
  }, [])

  useHotkeys(
    'tab',
    () => {
      handleHoverWord(true)
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys(
    'tab',
    () => {
      handleHoverWord(false)
    },
    { enableOnFormTags: true, keyup: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+j',
    () => {
      if (state.isTyping) {
        wordPronunciationIconRef.current?.play()
      }
    },
    [state.isTyping],
    { enableOnFormTags: true, preventDefault: true },
  )

  useEffect(() => {
    if (wordState.inputWord.length === 0 && state.isTyping) {
      wordPronunciationIconRef.current?.play && wordPronunciationIconRef.current?.play()
    }
  }, [state.isTyping, wordState.inputWord.length, wordPronunciationIconRef.current?.play])

  const getLetterVisible = useCallback(
    (index: number) => {
      if (wordState.letterStates[index] === 'correct' || (isShowAnswerOnHover && isHoveringWord)) return true
      if (isTextEntry && wordState.displayWord[index] === EXPLICIT_SPACE) return true

      if (wordDictationConfig.isOpen) {
        if (wordDictationConfig.type === 'hideAll') return false

        const letter = wordState.displayWord[index]
        if (wordDictationConfig.type === 'hideVowel') {
          return vowelLetters.includes(letter.toUpperCase()) ? false : true
        }
        if (wordDictationConfig.type === 'hideConsonant') {
          return vowelLetters.includes(letter.toUpperCase()) ? true : false
        }
        if (wordDictationConfig.type === 'randomHide') {
          return wordState.randomLetterVisible[index]
        }
      }
      return true
    },
    [
      isHoveringWord,
      isShowAnswerOnHover,
      wordDictationConfig.isOpen,
      wordDictationConfig.type,
      wordState.displayWord,
      wordState.letterStates,
      wordState.randomLetterVisible,
      isTextEntry,
    ],
  )

  useEffect(() => {
    if (isTextEntry) return
    const inputLength = wordState.inputWord.length
    /**
     * TODO: 当用户输入错误时，会报错
     * Cannot update a component (`App`) while rendering a different component (`WordComponent`). To locate the bad setState() call inside `WordComponent`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
     * 目前不影响生产环境，猜测是因为开发环境下 react 会两次调用 useEffect 从而展示了这个 warning
     * 但这终究是一个 bug，需要修复
     */
    if (wordState.hasWrong || inputLength === 0 || wordState.displayWord.length === 0) {
      return
    }

    const inputChar = wordState.inputWord[inputLength - 1]
    const correctChar = wordState.displayWord[inputLength - 1]
    let isEqual = false
    if (inputChar != undefined && correctChar != undefined) {
      isEqual = isIgnoreCase ? inputChar.toLowerCase() === correctChar.toLowerCase() : inputChar === correctChar
    }

    if (isEqual) {
      // 输入正确时
      setWordState((state) => {
        state.letterTimeArray.push(Date.now())
        state.correctCount += 1
      })

      if (inputLength >= wordState.displayWord.length) {
        // 完成输入时
        setWordState((state) => {
          state.letterStates[inputLength - 1] = 'correct'
          state.isFinished = true
          state.endTime = getUtcStringForMixpanel()
        })
        playHintSound()
      } else {
        setWordState((state) => {
          state.letterStates[inputLength - 1] = 'correct'
        })
        playKeySound()
      }

      dispatch({ type: TypingStateActionType.REPORT_CORRECT_WORD })
    } else {
      // 出错时
      playBeepSound()
      setWordState((state) => {
        state.letterStates[inputLength - 1] = 'wrong'
        state.hasWrong = true
        state.hasMadeInputWrong = true
        state.wrongCount += 1
        state.letterTimeArray = []

        if (state.letterMistake[inputLength - 1]) {
          state.letterMistake[inputLength - 1].push(inputChar)
        } else {
          state.letterMistake[inputLength - 1] = [inputChar]
        }

        const currentState = JSON.parse(JSON.stringify(state))
        dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD, payload: { letterMistake: currentState.letterMistake } })
      })

      if (currentChapter === 0 && state.chapterData.index === 0 && wordState.wrongCount >= 3) {
        setShowTipAlert(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.inputWord])

  useEffect(() => {
    if (wordState.hasWrong && !isTextEntry) {
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
  }, [wordState.hasWrong, setWordState, isTextEntry])

  useEffect(() => {
    if (wordState.isFinished) {
      dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: true })

      // wordLogUploader({
      //   headword: word.name,
      //   timeStart: wordState.startTime,
      //   timeEnd: wordState.endTime,
      //   countInput: wordState.correctCount + wordState.wrongCount,
      //   countCorrect: wordState.correctCount,
      //   countTypo: wordState.wrongCount,
      // })
      saveWordRecord({
        word: word.name,
        wrongCount: wordState.wrongCount,
        letterTimeArray: wordState.letterTimeArray,
        letterMistake: wordState.letterMistake,
        ...(isTextEntry
          ? { contentType, practiceText: wordState.displayWord.replaceAll(EXPLICIT_SPACE, ' '), characterCount: wordState.correctCount }
          : {}),
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
      <InputHandler updateInput={updateInput} allowDelete={isTextEntry} />
      <div
        lang={currentLanguageCategory !== 'code' ? currentLanguageCategory : 'en'}
        className={`flex flex-col items-center justify-center pb-1 pt-4 ${isTextEntry ? 'w-full min-w-0' : ''}`}
      >
        {['romaji', 'hapin'].includes(currentLanguage) && word.notation && <Notation notation={word.notation} />}
        <div
          className={`tooltip-info relative ${
            isTextEntry ? 'w-full min-w-0' : 'w-fit'
          } bg-transparent p-0 leading-normal shadow-none dark:bg-transparent ${wordDictationConfig.isOpen ? 'tooltip' : ''}`}
          data-tip="按 Tab 快捷键显示完整单词"
        >
          <div
            ref={textPanel}
            role={isTextEntry ? 'group' : undefined}
            aria-label={isTextEntry ? '短语与句子练习' : undefined}
            data-input={isTextEntry ? wordState.inputWord.replaceAll(EXPLICIT_SPACE, ' ') : undefined}
            onMouseEnter={() => handleHoverWord(true)}
            onMouseLeave={() => handleHoverWord(false)}
            className={`flex items-center ${isTextSelectable && 'select-all'} ${
              isTextEntry ? 'max-h-[42vh] w-full flex-wrap justify-start overflow-y-auto px-2' : 'justify-center'
            } ${wordState.hasWrong && !isTextEntry ? style.wrong : ''}`}
          >
            {isTextEntry
              ? (() => {
                  let offset = 0
                  return wordState.displayWord.split(EXPLICIT_SPACE).map((token, tokenIndex, tokens) => {
                    const start = offset
                    const segment = token + (tokenIndex < tokens.length - 1 ? EXPLICIT_SPACE : '')
                    offset += segment.length
                    return (
                      <span key={`${tokenIndex}-${token}`} className="inline-flex max-w-full flex-wrap" data-token={token}>
                        {segment.split('').map((letter, index) => (
                          <Letter
                            key={start + index}
                            letter={letter}
                            visible={getLetterVisible(start + index)}
                            state={wordState.letterStates[start + index]}
                            maxFontSize={contentType === 'sentence' ? 36 : 44}
                            active={start + index === wordState.inputWord.length - (wordState.hasWrong ? 1 : 0)}
                          />
                        ))}
                      </span>
                    )
                  })
                })()
              : wordState.displayWord.split('').map((t, index) => {
                  return <Letter key={`${index}-${t}`} letter={t} visible={getLetterVisible(index)} state={wordState.letterStates[index]} />
                })}
          </div>
          {pronunciationIsOpen && (
            <div className={isTextEntry ? 'mt-3 flex h-9 w-9 self-end' : 'absolute -right-12 top-1/2 h-9 w-9 -translate-y-1/2 transform'}>
              <Tooltip content={`快捷键${CTRL} + J`}>
                <WordPronunciationIcon word={word} lang={currentLanguage} ref={wordPronunciationIconRef} className="h-full w-full" />
              </Tooltip>
            </div>
          )}
        </div>
        {isTextEntry && (
          <p className="mt-2 text-xs text-gray-500">
            {Math.min(wordState.inputWord.length - (wordState.hasWrong ? 1 : 0), wordState.displayWord.length)} /{' '}
            {wordState.displayWord.length} 字符 · 输错后按 Backspace 修改
          </p>
        )}
      </div>
      <TipAlert className="fixed bottom-10 right-3" show={showTipAlert} setShow={setShowTipAlert} />
    </>
  )
}
