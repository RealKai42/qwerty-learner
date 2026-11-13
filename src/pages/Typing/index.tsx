import Layout from '../../components/Layout'
import { DictChapterButton } from './components/DictChapterButton'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import ResultScreen from './components/ResultScreen'
import Speed from './components/Speed'
import StartButton from './components/StartButton'
import Switcher from './components/Switcher'
import WordList from './components/WordList'
import WordPanel from './components/WordPanel'
import { useConfetti } from './hooks/useConfetti'
import { useWordList } from './hooks/useWordList'
import { TypingContext, TypingStateActionType, initialState, typingReducer } from './store'
import Header from '@/components/Header'
import Tooltip from '@/components/Tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import {
  currentChapterAtom,
  currentDictIdAtom,
  isReviewModeAtom,
  randomConfigAtom,
  reviewModeInfoAtom,
  webdavBackupErrorAtom,
  webdavConfigAtom,
} from '@/store'
import { isLegal } from '@/utils'
import { db, useSaveChapterRecord } from '@/utils/db'
import { useMixPanelChapterLogUploader } from '@/utils/mixpanel'
import { incrementalBackupToWebDAV, isBackupInProgress } from '@/utils/webdav'
import i18n from 'i18next'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { useImmerReducer } from 'use-immer'

const App: React.FC = () => {
  const [state, dispatch] = useImmerReducer(typingReducer, initialState)
  const { words } = useWordList()
  const isLoading = !state.chapterData.words?.length

  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const chapterLogUploader = useMixPanelChapterLogUploader(state)
  const saveChapterRecord = useSaveChapterRecord()

  const reviewModeInfo = useAtomValue(reviewModeInfoAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)

  // 在组件挂载和currentDictId改变时，检查当前字典是否存在，如果不存在，则将其重置为默认值
  useEffect(() => {
    const id = currentDictId
    if (!(id in idDictionaryMap)) {
      setCurrentDictId('cet4')
      setCurrentChapter(0)
      return
    }
  }, [currentDictId, setCurrentChapter, setCurrentDictId])

  const skipWord = useCallback(() => {
    dispatch({ type: TypingStateActionType.SKIP_WORD })
  }, [dispatch])

  useEffect(() => {
    const onBlur = () => {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
    }
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [dispatch])

  useEffect(() => {
    if (!state.isTyping) {
      const onKeyDown = (e: KeyboardEvent) => {
        const target = e.target
        if (
          e.defaultPrevented ||
          e.isComposing ||
          (target instanceof HTMLElement && (target.closest('input, textarea, select, [role="dialog"]') || target.isContentEditable))
        ) {
          return
        }
        if (!isLoading && e.key !== 'Enter' && (isLegal(e.key) || e.key === ' ') && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return () => window.removeEventListener('keydown', onKeyDown)
    }
  }, [state.isTyping, isLoading, dispatch])

  const isReviewModeRef = useRef(isReviewMode)
  isReviewModeRef.current = isReviewMode
  const reviewModeInfoRef = useRef(reviewModeInfo)
  reviewModeInfoRef.current = reviewModeInfo
  const randomConfigRef = useRef(randomConfig)
  randomConfigRef.current = randomConfig

  useEffect(() => {
    if (words !== undefined) {
      const initialIndex =
        isReviewModeRef.current && reviewModeInfoRef.current.reviewRecord?.index ? reviewModeInfoRef.current.reviewRecord.index : 0
      dispatch({
        type: TypingStateActionType.SETUP_CHAPTER,
        payload: { words, shouldShuffle: randomConfigRef.current.isOpen, initialIndex },
      })
    }
  }, [words, dispatch])

  const webdavConfig = useAtomValue(webdavConfigAtom)

  // 自动备份（增量）— 带防抖和互斥锁
  const backupTimerRef = useRef<number | null>(null)

  const stateRef = useRef(state)
  stateRef.current = state
  const chapterLogUploaderRef = useRef(chapterLogUploader)
  chapterLogUploaderRef.current = chapterLogUploader

  useEffect(() => {
    // 当用户完成章节后且完成 word Record 数据保存，记录 chapter Record 数据,
    if (state.isFinished && !state.isSavingRecord) {
      chapterLogUploaderRef.current()
      ;(async () => {
        await saveChapterRecord(stateRef.current)
      })()
    }
  }, [state.isFinished, state.isSavingRecord, saveChapterRecord])

  const setWebdavBackupError = useSetAtom(webdavBackupErrorAtom)
  const webdavConfigRef = useRef(webdavConfig)
  const timerTimeRef = useRef(state.timerData.time)

  // Keep refs in sync so callbacks always read the latest values
  webdavConfigRef.current = webdavConfig
  timerTimeRef.current = state.timerData.time

  // 暂停或完成章节时触发自动备份（防抖 3 秒 + 互斥锁）
  useEffect(() => {
    const config = webdavConfigRef.current
    const shouldBackup = config.enabled && config.autoBackup && config.url
    const isTrigger = (state.isFinished && !state.isSavingRecord) || (!state.isTyping && timerTimeRef.current > 0 && !state.isFinished)

    if (shouldBackup && isTrigger) {
      if (backupTimerRef.current) clearTimeout(backupTimerRef.current)
      backupTimerRef.current = window.setTimeout(async () => {
        if (isBackupInProgress()) return
        try {
          const wordRecords = await db.wordRecords.toArray()
          const chapterRecords = await db.chapterRecords.toArray()
          const reviewRecords = await db.reviewRecords.toArray()
          const favoriteRecords = await db.favoriteRecords.toArray()
          const result = await incrementalBackupToWebDAV(
            { wordRecords, chapterRecords, reviewRecords, favoriteRecords },
            webdavConfigRef.current,
          )
          if (!result.success) {
            setWebdavBackupError(result.message)
          } else {
            setWebdavBackupError(null)
          }
        } catch (e) {
          setWebdavBackupError(i18n.t('typing.autoBackupFailed'))
        }
      }, 3000)
    }
    return () => {
      if (backupTimerRef.current) clearTimeout(backupTimerRef.current)
    }
  }, [state.isTyping, state.isFinished, state.isSavingRecord, setWebdavBackupError])

  useEffect(() => {
    // 启动计时器
    let intervalId: number | undefined
    if (state.isTyping) {
      intervalId = window.setInterval(() => {
        dispatch({ type: TypingStateActionType.TICK_TIMER })
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [state.isTyping, dispatch])

  useConfetti(state.isFinished)

  return (
    <TypingContext.Provider value={{ state: state, dispatch }}>
      {state.isFinished && <ResultScreen />}
      <Layout>
        <Header>
          <DictChapterButton />
          <PronunciationSwitcher />
          <Switcher />
          <StartButton isLoading={isLoading} />
          <Tooltip content={i18n.t('typing.skipWord')}>
            <button
              className={`${
                state.isShowSkip ? 'bg-orange-400' : 'invisible w-0 bg-gray-300 px-0 opacity-0'
              } my-btn-primary transition-all duration-300 `}
              onClick={skipWord}
            >
              Skip
            </button>
          </Tooltip>
        </Header>
        <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-5">
          <div className="container relative mx-auto flex h-full flex-col items-center">
            <div className="container flex flex-grow items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center ">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid  border-indigo-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  ></div>
                </div>
              ) : (
                !state.isFinished && <WordPanel />
              )}
            </div>
            <Speed />
          </div>
        </div>
      </Layout>
      <WordList />
    </TypingContext.Provider>
  )
}

export default App
