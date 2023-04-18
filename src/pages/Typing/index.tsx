import Layout from '../../components/Layout'
import CurrentWord from './components/CurrentWord'
import Progress from './components/Progress'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import ResultScreen from './components/ResultScreen'
import Speed from './components/Speed'
import Switcher from './components/Switcher'
import { useWordList } from './hooks/useWordList'
import { initialState, TypingContext, typingReducer, TypingStateActionType } from './store'
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import StarCard from '@/components/StarCard'
import Tooltip from '@/components/Tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import { currentChapterAtom, currentDictIdAtom, currentDictInfoAtom, isLoopSingleWordAtom, randomConfigAtom } from '@/store'
import { IsDesktop, isLegal } from '@/utils'
import { useSaveChapterRecord } from '@/utils/db'
import { useMixPanelChapterLogUploader } from '@/utils/mixpanel'
import { useAtom, useAtomValue } from 'jotai'
import React, { useCallback, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { NavLink } from 'react-router-dom'
import { useImmerReducer } from 'use-immer'

const App: React.FC = () => {
  const [typingState, dispatch] = useImmerReducer(typingReducer, structuredClone(initialState))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { words } = useWordList()
  const currentWord = typingState.chapterData.words[typingState.chapterData.index]

  const currentChapter = useAtomValue(currentChapterAtom)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  const chapterLogUploader = useMixPanelChapterLogUploader(typingState)
  const saveChapterRecord = useSaveChapterRecord()

  const isLoopSingleWord = useAtomValue(isLoopSingleWordAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const [wordComponentKey, setWordComponentKey] = useState(0)

  const reloadCurrentWordComponent = useCallback(() => {
    setWordComponentKey((old) => old + 1)
  }, [])

  useEffect(() => {
    // 检测用户设备
    if (!IsDesktop()) {
      setTimeout(() => {
        alert(
          ' Qwerty Learner 目的为提高键盘工作者的英语输入效率，目前暂未适配移动端，希望您使用桌面端浏览器访问。如您使用的是 Ipad 等平板电脑设备，可以使用外接键盘使用本软件。',
        )
      }, 500)
    }
  }, [])

  // 在组件挂载和currentDictId改变时，检查当前字典是否存在，如果不存在，则将其重置为默认值
  useEffect(() => {
    const id = currentDictId
    if (!(id in idDictionaryMap)) {
      setCurrentDictId('cet4')
    }
  }, [currentDictId, setCurrentDictId])

  useHotkeys(
    'enter',
    () => {
      dispatch({ type: TypingStateActionType.TOGGLE_IS_TYPING })
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
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
    if (!typingState.isTyping) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && (isLegal(e.key) || e.key === ' ') && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return () => {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [typingState.isTyping, dispatch])

  useEffect(() => {
    if (words !== undefined) {
      dispatch({
        type: TypingStateActionType.SETUP_CHAPTER,
        payload: { words, shouldShuffle: randomConfig.isOpen },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  useEffect(() => {
    if (typingState.chapterData.words?.length > 0) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [typingState.chapterData.words])

  const skipWord = useCallback(() => {
    dispatch({ type: TypingStateActionType.SKIP_WORD })
  }, [dispatch])

  const onFinish = () => {
    if (typingState.chapterData.index < typingState.chapterData.words.length - 1 || isLoopSingleWord) {
      // 用户完成当前单词
      if (isLoopSingleWord) {
        dispatch({ type: TypingStateActionType.LOOP_CURRENT_WORD })
        reloadCurrentWordComponent()
      } else {
        dispatch({ type: TypingStateActionType.NEXT_WORD })
      }
    } else {
      // 用户完成当前章节
      dispatch({ type: TypingStateActionType.FINISH_CHAPTER })
    }
  }

  useEffect(() => {
    // 当用户完成章节后且完成 word Record 数据保存，记录 chapter Record 数据,
    if (typingState.isFinished && !typingState.isSavingRecord) {
      chapterLogUploader()
      saveChapterRecord(typingState)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingState.isFinished, typingState.isSavingRecord])

  useEffect(() => {
    // 启动计时器
    let intervalId: number
    if (typingState.isTyping) {
      intervalId = window.setInterval(() => {
        dispatch({ type: TypingStateActionType.TICK_TIMER })
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [typingState.isTyping, dispatch])

  return (
    <TypingContext.Provider value={{ state: typingState, dispatch }}>
      <StarCard />
      {typingState.isFinished && <ResultScreen />}
      {isLoading ? (
        <Loading />
      ) : (
        <Layout>
          <Header>
            <Tooltip content="词典章节切换">
              <NavLink
                className="block rounded-lg px-3 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
                to="/gallery"
              >
                {currentDictInfo.name} 第 {currentChapter + 1} 章
              </NavLink>
            </Tooltip>
            <PronunciationSwitcher />
            <Switcher />
            <Tooltip content="快捷键 Enter">
              <button
                className={`${
                  typingState.isTyping ? 'bg-gray-300 dark:bg-gray-700' : 'bg-indigo-400'
                }  btn-primary w-20 transition-colors duration-300`}
                onClick={() => {
                  dispatch({ type: TypingStateActionType.TOGGLE_IS_TYPING })
                }}
              >
                {typingState.isTyping ? 'Pause' : 'Start'}
              </button>
            </Tooltip>
            <Tooltip content="跳过该词">
              <button
                className={`${
                  typingState.isShowSkip ? 'bg-orange-400' : 'invisible w-0 bg-gray-300 px-0 opacity-0'
                } btn-primary transition-all duration-300 `}
                onClick={skipWord}
              >
                Skip
              </button>
            </Tooltip>
          </Header>
          <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-20">
            <div className="container relative mx-auto flex h-full flex-col items-center">
              <div className="h-1/3"></div>
              {!typingState.isFinished && (
                <>
                  {typingState.isTyping ? (
                    <>
                      {currentWord && <CurrentWord word={currentWord} key={wordComponentKey} onFinish={onFinish} />}
                      <Progress order={typingState.chapterData.index} wordsLength={typingState.chapterData.words.length} />
                    </>
                  ) : (
                    <h3 className="animate-pulse select-none pb-4 text-xl text-gray-600 dark:text-gray-50">按任意键开始</h3>
                  )}
                  <Speed />
                </>
              )}
            </div>
          </div>
        </Layout>
      )}
    </TypingContext.Provider>
  )
}

export default App
