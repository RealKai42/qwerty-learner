import React, { useCallback, useEffect, useReducer, useState } from 'react'
import Header from '@/components/Header'
import Speed from './components/Speed'
import Loading from '@/components/Loading'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import { IsDesktop, isLegal } from '@/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import Switcher from './components/Switcher'
import { useWordList } from './hooks/useWordList'
import Layout from '../../components/Layout'
import { NavLink } from 'react-router-dom'
import Tooltip from '@/components/Tooltip'
import Progress from './components/Progress'
import ResultScreen from './components/ResultScreen'
import CurrentWord from './components/CurrentWord'
import { useAtomValue } from 'jotai'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isOpenDarkModeAtom,
  keySoundsConfigAtom,
  phoneticConfigAtom,
  pronunciationConfigAtom,
  randomConfigAtom,
} from '@/store'
import { ChapterStatUpload, WordStat, WordStatUpload } from '@/typings'
import mixpanel from 'mixpanel-browser'
import dayjs from 'dayjs'
import StarCard from '@/components/StarCard'
import { initialState, TypingContext, typingReducer, TypingStateActionType } from './store'

const App: React.FC = () => {
  const [typingState, dispatch] = useReducer(typingReducer, initialState)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { words } = useWordList()
  const currentWord = typingState.chapterData.words[typingState.chapterData.index]

  const currentChapter = useAtomValue(currentChapterAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const randomConfig = useAtomValue(randomConfigAtom)

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

  useHotkeys(
    'enter',
    () => {
      dispatch({ type: TypingStateActionType.TOGGLE_IS_TYPING })
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useEffect(() => {
    if (!typingState.isTyping) {
      const onKeyDown = (e: KeyboardEvent) => {
        e.preventDefault()
        if (e.key !== 'Enter' && isLegal(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
          dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
        }
      }
      window.addEventListener('keydown', onKeyDown)

      return () => {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [typingState.isTyping])

  useEffect(() => {
    if (words !== undefined) {
      dispatch({
        type: TypingStateActionType.SETUP_CHAPTER,
        payload: words,
      })
    }
  }, [words])

  useEffect(() => {
    if (typingState.chapterData.words?.length > 0) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [typingState.chapterData.words])

  useEffect(() => {
    const onBlur = () => {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
    }
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const skipWord = useCallback(() => {
    dispatch({ type: TypingStateActionType.SKIP_WORD })
  }, [])

  const onFinish = (wordStat: WordStat) => {
    if (typingState.chapterData.index < typingState.chapterData.words.length - 1) {
      dispatch({ type: TypingStateActionType.NEXT_WORD })
      const wordStatUpload: WordStatUpload = {
        ...wordStat,
        order: typingState.chapterData.index + 1,
        chapter: (currentChapter + 1).toString(),
        wordlist: currentDictInfo.name,
        modeDictation: !typingState.isWordVisible,
        modeDark: isDarkMode,
        modeShuffle: randomConfig.isOpen,
        enabledKeyboardSound: keySoundsConfig.isOpen,
        enabledPhotonicsSymbol: phoneticConfig.isOpen,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }
      mixpanel.track('Word', wordStatUpload)
    } else {
      // 用户完成当前章节
      dispatch({ type: TypingStateActionType.FINISH_CHAPTER })

      const chapterStatUpload: ChapterStatUpload = {
        timeEnd: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
        duration: typingState.timerData.time,
        countInput: typingState.chapterData.correctCount + typingState.chapterData.wrongCount,
        countTypo: typingState.chapterData.wrongCount,
        countCorrect: typingState.chapterData.correctCount,
        chapter: (currentChapter + 1).toString(),
        wordlist: currentDictInfo.name,
        modeDictation: !typingState.isWordVisible,
        modeDark: isDarkMode,
        modeShuffle: randomConfig.isOpen,
        enabledKeyboardSound: keySoundsConfig.isOpen,
        enabledPhotonicsSymbol: phoneticConfig.isOpen,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }

      mixpanel.track('Chapter', chapterStatUpload)
    }
  }

  useEffect(() => {
    // 启动计时器
    let intervalId: number
    if (typingState.isTyping) {
      intervalId = window.setInterval(() => {
        dispatch({ type: TypingStateActionType.TICK_TIMER })
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [typingState.isTyping])

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
                      {currentWord && <CurrentWord word={currentWord} onFinish={onFinish} />}
                      <Progress order={typingState.chapterData.index} wordsLength={typingState.chapterData.words.length} />
                    </>
                  ) : (
                    <h3 className="animate-pulse pb-4 text-xl text-gray-600 dark:text-gray-50">按任意键开始</h3>
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
