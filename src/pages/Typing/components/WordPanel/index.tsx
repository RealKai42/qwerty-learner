import { TypingStateActionType, useTypingContext } from '../../store'
import type { TypingState } from '../../store/type'
import PrevAndNextWord from '../PrevAndNextWord'
import Progress from '../Progress'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import WordComponent from './components/Word'
import { useFavorite } from '@/hooks/useFavorite'
import { usePrefetchPronunciationSound } from '@/hooks/usePronunciation'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isReviewModeAtom,
  isShowPrevAndNextWordAtom,
  loopWordConfigAtom,
  phoneticConfigAtom,
  reviewModeInfoAtom,
  typingShortcutConfigAtom,
} from '@/store'
import type { Word } from '@/typings'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'

export default function WordPanel() {
  const { t } = useTranslation()
  const { state, dispatch } = useTypingContext()
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isShowPrevAndNextWord = useAtomValue(isShowPrevAndNextWordAtom)
  const [wordComponentKey, setWordComponentKey] = useState(0)
  const [currentWordExerciseCount, setCurrentWordExerciseCount] = useState(0)
  const { times: loopWordTimes } = useAtomValue(loopWordConfigAtom)
  const currentWord = state.chapterData.words[state.chapterData.index]
  const nextWord = state.chapterData.words[state.chapterData.index + 1] as Word | undefined

  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const { toggle } = useFavorite()
  const typingShortcutConfig = useAtomValue(typingShortcutConfigAtom)

  const prevIndex = useMemo(() => {
    const newIndex = state.chapterData.index - 1
    return newIndex < 0 ? 0 : newIndex
  }, [state.chapterData.index])
  const nextIndex = useMemo(() => {
    const newIndex = state.chapterData.index + 1
    return newIndex > state.chapterData.words.length - 1 ? state.chapterData.words.length - 1 : newIndex
  }, [state.chapterData.index, state.chapterData.words.length])

  usePrefetchPronunciationSound(nextWord?.name)

  const reloadCurrentWordComponent = useCallback(() => {
    setWordComponentKey((old) => old + 1)
  }, [])

  const updateReviewRecord = useCallback(
    (state: TypingState) => {
      setReviewModeInfo((old) => ({
        ...old,
        reviewRecord: old.reviewRecord ? { ...old.reviewRecord, index: state.chapterData.index } : undefined,
      }))
    },
    [setReviewModeInfo],
  )

  const onFinish = useCallback(() => {
    if (state.chapterData.index < state.chapterData.words.length - 1 || currentWordExerciseCount < loopWordTimes - 1) {
      // 用户完成当前单词
      if (currentWordExerciseCount < loopWordTimes - 1) {
        setCurrentWordExerciseCount((old) => old + 1)
        dispatch({ type: TypingStateActionType.LOOP_CURRENT_WORD })
        reloadCurrentWordComponent()
      } else {
        setCurrentWordExerciseCount(0)
        if (isReviewMode) {
          dispatch({
            type: TypingStateActionType.NEXT_WORD,
            payload: {
              updateReviewRecord,
            },
          })
        } else {
          dispatch({ type: TypingStateActionType.NEXT_WORD })
        }
        reloadCurrentWordComponent()
      }
    } else {
      // 用户完成当前章节
      dispatch({ type: TypingStateActionType.FINISH_CHAPTER })
      if (isReviewMode) {
        setReviewModeInfo((old) => ({ ...old, reviewRecord: old.reviewRecord ? { ...old.reviewRecord, isFinished: true } : undefined }))
      }
    }
  }, [
    state.chapterData.index,
    state.chapterData.words.length,
    currentWordExerciseCount,
    loopWordTimes,
    dispatch,
    reloadCurrentWordComponent,
    isReviewMode,
    updateReviewRecord,
    setReviewModeInfo,
  ])

  const onSkipWord = useCallback(
    (type: 'prev' | 'next') => {
      if (type === 'prev') {
        dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex: prevIndex })
      }

      if (type === 'next') {
        dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex: nextIndex })
      }
    },
    [dispatch, prevIndex, nextIndex],
  )

  useHotkeys(
    typingShortcutConfig.prevWord,
    (e) => {
      e.preventDefault()
      onSkipWord('prev')
    },
    [typingShortcutConfig.prevWord, onSkipWord],
    { preventDefault: true },
  )

  useHotkeys(
    typingShortcutConfig.nextWord,
    (e) => {
      e.preventDefault()
      onSkipWord('next')
    },
    [typingShortcutConfig.nextWord, onSkipWord],
    { preventDefault: true },
  )

  const toggleAdjacentFavorite = useCallback(
    (type: 'prev' | 'next') => {
      const newIndex = state.chapterData.index + (type === 'prev' ? -1 : 1)
      const word = state.chapterData.words[newIndex]
      if (!word) return
      void toggle(word.name, currentDictInfo.id, isReviewMode ? -1 : currentChapter)
    },
    [state.chapterData.index, state.chapterData.words, currentDictInfo.id, isReviewMode, currentChapter, toggle],
  )

  useHotkeys(
    typingShortcutConfig.favoritePrev,
    (e) => {
      e.preventDefault()
      toggleAdjacentFavorite('prev')
    },
    [typingShortcutConfig.favoritePrev, toggleAdjacentFavorite],
    { preventDefault: true },
  )

  useHotkeys(
    typingShortcutConfig.favoriteNext,
    (e) => {
      e.preventDefault()
      toggleAdjacentFavorite('next')
    },
    [typingShortcutConfig.favoriteNext, toggleAdjacentFavorite],
    { preventDefault: true },
  )

  const [isShowTranslation, setIsHoveringTranslation] = useState(false)

  const handleShowTranslation = useCallback((checked: boolean) => {
    setIsHoveringTranslation(checked)
  }, [])

  useHotkeys(
    'tab',
    () => {
      handleShowTranslation(true)
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys(
    'tab',
    () => {
      handleShowTranslation(false)
    },
    { enableOnFormTags: true, keyup: true, preventDefault: true },
    [],
  )

  const shouldShowTranslation = useMemo(() => {
    return isShowTranslation || state.isTransVisible
  }, [isShowTranslation, state.isTransVisible])

  return (
    <div className="container flex h-full w-full flex-col items-center justify-center">
      <div className="container flex h-16 w-full shrink-0 grow-0 justify-between px-6 pt-4 md:h-24 md:px-12 md:pt-10">
        {isShowPrevAndNextWord && state.isTyping && (
          <>
            <PrevAndNextWord type="prev" onToggleFavorite={toggleAdjacentFavorite} />
            <PrevAndNextWord type="next" onToggleFavorite={toggleAdjacentFavorite} />
          </>
        )}
      </div>
      <div className="container flex flex-grow flex-col items-center justify-center">
        {currentWord && (
          <div className="relative flex w-full justify-center">
            {!state.isTyping && (
              <div className="absolute flex h-full w-full justify-center">
                <div className="z-10 flex w-full items-center backdrop-blur-sm">
                  <p className="w-full select-none text-center text-xl text-gray-600 dark:text-gray-50">
                    {t('typing.pressAnyKeyPrefix')}
                    {state.timerData.time ? t('typing.pressAnyKeyContinue') : t('typing.pressAnyKeyStart')}
                  </p>
                </div>
              </div>
            )}
            <div className="relative">
              <WordComponent word={currentWord} onFinish={onFinish} key={wordComponentKey} />
              {phoneticConfig.isOpen && <Phonetic word={currentWord} />}
              <Translation
                trans={currentWord.trans.join('；')}
                showTrans={shouldShowTranslation}
                onMouseEnter={() => handleShowTranslation(true)}
                onMouseLeave={() => handleShowTranslation(false)}
              />
            </div>
          </div>
        )}
      </div>
      <Progress className={`mb-10 mt-auto ${state.isTyping ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
