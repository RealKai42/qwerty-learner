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
import { useFavorite } from '@/hooks/useFavorite'
import useKeySounds from '@/hooks/useKeySounds'
import { TypingStateActionType, useTypingContext } from '@/pages/Typing/store'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isIgnoreCaseAtom,
  isReviewModeAtom,
  isShowAnswerOnHoverAtom,
  isSkipParenthesesAtom,
  isTextSelectableAtom,
  pronunciationIsOpenAtom,
  typingShortcutConfigAtom,
  wordDictationConfigAtom,
} from '@/store'
import type { Word } from '@/typings'
import { getUtcStringForMixpanel } from '@/utils'
import { useSaveWordRecord } from '@/utils/db'
import type { LetterMistakes } from '@/utils/db/record'
import { formatShortcut } from '@/utils/hotkeys'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { useImmer } from 'use-immer'
import IconStar from '~icons/tabler/star'
import IconStarFilled from '~icons/tabler/star-filled'

const SPACE_RE = / /g
const ELLIPSIS_RE = /…/g
const PARENTHESES_RE = /[（(][^)）]*[)）]/g

const vowelLettersByLang: Record<string, string[]> = {
  de: ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü'],
  default: ['A', 'E', 'I', 'O', 'U'],
}

function getVowelLetters(lang: string): string[] {
  return vowelLettersByLang[lang] || vowelLettersByLang.default
}

export default function WordComponent({ word, onFinish }: { word: Word; onFinish: () => void }) {
  const { t } = useTranslation()
  const { state, dispatch } = useTypingContext()
  const [wordState, setWordState] = useImmer<WordState>(initialWordState)

  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const isIgnoreCase = useAtomValue(isIgnoreCaseAtom)
  const isSkipParentheses = useAtomValue(isSkipParenthesesAtom)
  const isShowAnswerOnHover = useAtomValue(isShowAnswerOnHoverAtom)
  const saveWordRecord = useSaveWordRecord()
  const [playKeySound, playBeepSound, playHintSound] = useKeySounds()
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)
  const [isHoveringWord, setIsHoveringWord] = useState(false)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentLanguage = currentDictInfo.language
  const currentLanguageCategory = currentDictInfo.languageCategory
  const currentChapter = useAtomValue(currentChapterAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)
  const { isFavorite, toggle } = useFavorite()
  const typingShortcutConfig = useAtomValue(typingShortcutConfigAtom)

  const [showTipAlert, setShowTipAlert] = useState(false)
  const wordStateRef = useRef(wordState)
  wordStateRef.current = wordState
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)
  const currentChapterRef = useRef(currentChapter)
  currentChapterRef.current = currentChapter
  const chapterIndexRef = useRef(state.chapterData.index)
  chapterIndexRef.current = state.chapterData.index

  useEffect(() => {
    // run only when word changes
    let headword = ''
    try {
      headword = word.name.replace(SPACE_RE, EXPLICIT_SPACE)
      headword = headword.replace(ELLIPSIS_RE, '..')
      if (isSkipParentheses) {
        headword = headword.replace(PARENTHESES_RE, '')
      }
    } catch (e) {
      console.error('word.name is not a string', word)
      headword = ''
    }

    const newWordState: WordState = {
      ...initialWordState,
      letterStates: [],
      letterTimeArray: [],
      letterMistake: {},
      randomLetterVisible: [],
    }
    newWordState.displayWord = headword
    newWordState.letterStates = new Array(headword.length).fill('normal')
    newWordState.startTime = getUtcStringForMixpanel()
    newWordState.randomLetterVisible = headword.split('').map(() => Math.random() > 0.4)
    setWordState(newWordState)
  }, [word, isSkipParentheses, setWordState])

  const updateInput = useCallback(
    (updateAction: WordUpdateAction) => {
      switch (updateAction.type) {
        case 'add':
          if (wordStateRef.current.hasWrong) return

          const value = updateAction.value === ' ' ? EXPLICIT_SPACE : updateAction.value
          const inputLength = wordStateRef.current.inputWord.length
          const correctChar = wordStateRef.current.displayWord[inputLength]
          const isEqual =
            correctChar != undefined && (isIgnoreCase ? value.toLowerCase() === correctChar.toLowerCase() : value === correctChar)

          // 音效在 keydown 事件内同步触发(按键音/答对音/答错音),不等 React 渲染,快速输入时无延迟
          if (isEqual) {
            if (inputLength + 1 >= wordStateRef.current.displayWord.length) {
              playHintSound()
            } else {
              playKeySound()
            }
          } else {
            playBeepSound()
          }

          updateAction.event.preventDefault()
          setWordState((state) => {
            state.inputWord = state.inputWord + value
          })
          break

        default:
          console.warn('unknown update type', updateAction)
      }
    },
    [isIgnoreCase, playKeySound, playBeepSound, playHintSound, setWordState],
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
    typingShortcutConfig.pronunciation,
    () => {
      if (state.isTyping) {
        wordPronunciationIconRef.current?.play()
      }
    },
    [typingShortcutConfig.pronunciation, state.isTyping],
    { enableOnFormTags: true, preventDefault: true },
  )

  useHotkeys(
    typingShortcutConfig.favoriteCurrent,
    () => {
      void toggle(word.name, currentDictInfo.id, isReviewMode ? -1 : currentChapter)
    },
    [typingShortcutConfig.favoriteCurrent, word, currentDictInfo.id, isReviewMode, currentChapter, toggle],
    { enableOnFormTags: true, preventDefault: true },
  )

  useEffect(() => {
    if (wordState.inputWord.length === 0 && state.isTyping) {
      wordPronunciationIconRef.current?.play()
    }
  }, [state.isTyping, wordState.inputWord.length])

  const getLetterVisible = useCallback(
    (index: number) => {
      if (wordState.letterStates[index] === 'correct' || (isShowAnswerOnHover && isHoveringWord)) return true

      if (wordDictationConfig.isOpen) {
        if (wordDictationConfig.type === 'hideAll') return false

        const letter = wordState.displayWord[index]
        const vowels = getVowelLetters(currentLanguage)
        if (wordDictationConfig.type === 'hideVowel') {
          return vowels.includes(letter.toUpperCase()) ? false : true
        }
        if (wordDictationConfig.type === 'hideConsonant') {
          return vowels.includes(letter.toUpperCase()) ? true : false
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
      currentLanguage,
    ],
  )

  useEffect(() => {
    const inputLength = wordState.inputWord.length
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
      // 输入正确时(按键音/答对音已在 keydown 事件内同步播放)
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
      } else {
        setWordState((state) => {
          state.letterStates[inputLength - 1] = 'correct'
        })
      }

      dispatch({ type: TypingStateActionType.REPORT_CORRECT_WORD })
    } else {
      // 出错时(答错音已在 keydown 事件内同步播放)
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
      })

      const mistake: LetterMistakes = {}
      for (const key of Object.keys(wordState.letterMistake)) {
        const k = Number(key)
        mistake[k] = [...wordState.letterMistake[k]]
      }
      dispatch({ type: TypingStateActionType.REPORT_WRONG_WORD, payload: { letterMistake: mistake } })

      if (currentChapterRef.current === 0 && chapterIndexRef.current === 0 && wordState.wrongCount >= 3) {
        setShowTipAlert(true)
      }
    }
  }, [wordState.inputWord, wordState.hasWrong, wordState.displayWord, wordState.wrongCount, isIgnoreCase, dispatch, setWordState])

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
      dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: true })

      saveWordRecord({
        word: word.name,
        wrongCount: wordState.wrongCount,
        letterTimeArray: wordState.letterTimeArray,
        letterMistake: wordState.letterMistake,
      })

      onFinish()
    }
  }, [
    wordState.isFinished,
    wordState.wrongCount,
    wordState.letterTimeArray,
    wordState.letterMistake,
    dispatch,
    saveWordRecord,
    onFinish,
    word.name,
  ])

  useEffect(() => {
    if (wordState.wrongCount >= 4) {
      dispatch({ type: TypingStateActionType.SET_IS_SKIP, payload: true })
    }
  }, [wordState.wrongCount, dispatch])

  return (
    <>
      <InputHandler updateInput={updateInput} />
      <div
        lang={currentLanguageCategory !== 'code' ? currentLanguageCategory : 'en'}
        className="flex flex-col items-center justify-center pb-1 pt-4"
      >
        {['romaji', 'hapin'].includes(currentLanguage) && word.notation && <Notation notation={word.notation} />}
        <div
          className={`tooltip-info relative w-fit bg-transparent p-0 leading-normal shadow-none dark:bg-transparent ${
            wordDictationConfig.isOpen ? 'tooltip' : ''
          }`}
          data-tip={t('typing.showFullWordTip')}
        >
          <div
            onMouseEnter={() => handleHoverWord(true)}
            onMouseLeave={() => handleHoverWord(false)}
            className={`flex items-center ${isTextSelectable && 'select-all'} justify-center ${wordState.hasWrong ? style.wrong : ''}`}
          >
            {wordState.displayWord.split('').map((t, index) => {
              return <Letter key={`${index}-${t}`} letter={t} visible={getLetterVisible(index)} state={wordState.letterStates[index]} />
            })}
          </div>
          <div
            className={`absolute top-1/2 flex -translate-y-1/2 transform items-center ${pronunciationIsOpen ? '-right-24' : '-right-12'}`}
          >
            {pronunciationIsOpen && (
              <div className="h-9 w-9">
                <Tooltip content={t('typing.pronunciation.pronShortcutTip', { key: formatShortcut(typingShortcutConfig.pronunciation) })}>
                  <WordPronunciationIcon word={word} lang={currentLanguage} ref={wordPronunciationIconRef} className="h-full w-full" />
                </Tooltip>
              </div>
            )}
            <Tooltip content={t('favorites.favoriteShortcutTip', { key: formatShortcut(typingShortcutConfig.favoriteCurrent) })}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.currentTarget.blur()
                  void toggle(word.name, currentDictInfo.id, isReviewMode ? -1 : currentChapter)
                }}
                className="flex h-9 w-9 items-center justify-center rounded p-1 text-lg outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white"
                title={t('favorites.favoriteToggle')}
                aria-label={t('favorites.favoriteToggle')}
              >
                {isFavorite(word.name, currentDictInfo.id) ? (
                  <IconStarFilled className="h-6 w-6 text-yellow-400" />
                ) : (
                  <IconStar className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <TipAlert className="fixed bottom-10 right-3" show={showTipAlert} setShow={setShowTipAlert} />
    </>
  )
}
