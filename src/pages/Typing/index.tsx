import React, { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Speed from '@/components/Speed'
import Loading from '@/components/Loading'
import PronunciationSwitcher from './components/PronunciationSwitcher'
import { isLegal, IsDesktop } from '@/utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import Switcher from './components/Switcher'
import { useWordList } from './hooks/useWordList'
import Layout from '../../components/Layout'
import { NavLink } from 'react-router-dom'
import Tooltip from '@/components/Tooltip'
import Progress from './components/Progress'
import ResultScreen, { IncorrectInfo, ResultSpeedInfo } from './components/ResultScreen'
import CurrentWord from './components/CurrentWord'
import { useAtom, useAtomValue } from 'jotai'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isOpenDarkModeAtom,
  isShowSkipAtom,
  keySoundsConfigAtom,
  phoneticConfigAtom,
  pronunciationConfigAtom,
  randomConfigAtom,
} from '@/store'
import { ChapterStatUpload, WordStat, WordStatUpload } from '@/typings'
import mixpanel from 'mixpanel-browser'
import dayjs from 'dayjs'

const App: React.FC = () => {
  const [order, setOrder] = useState<number>(0)
  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)
  const [wordVisible, setWordVisible] = useState<boolean>(true)
  const wordList = useWordList()
  const randomConfig = useAtomValue(randomConfigAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [isShowSkip, setIsShowSkip] = useAtom(isShowSkipAtom)

  const isDarkMode = useAtomValue(isOpenDarkModeAtom)
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  //props for ResultScreen
  const [resultScreenState, setResultScreenState] = useState<boolean>(false)
  const [incorrectInfo, setIncorrectInfo] = useState<IncorrectInfo[]>([])
  const [speedInfo, setSpeedInfo] = useState<ResultSpeedInfo>({ speed: '', minute: 0, second: 0 })

  useEffect(() => {
    // reset order when random change
    setOrder(0)
  }, [randomConfig.isOpen])

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
      if (resultScreenState === false && !isStart) {
        setIsStart((old) => (old ? old : true))
      }
    },
    [resultScreenState],
  )

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (!resultScreenState) {
        if (isLegal(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
          if (isStart) {
            setInputCount((count) => count + 1)
          }
        }
        setIsStart((old) => (old ? old : true))
      }
    }
    const onBlur = () => {
      setIsStart((old) => (old ? false : old))
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('keydown', onKeydown)

    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('blur', onBlur)
    }
  }, [isStart, resultScreenState])

  const skipWord = useCallback(() => {
    if (wordList === undefined) {
      return
    }
    // todo: bug, when user skip the last word of the chapter, the result screen will not show
    if (order < wordList.length - 1) {
      setOrder((order) => order + 1)
      // reset to false when skip
      setIsShowSkip(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, wordList])

  const onFinish = (everWrong: boolean, wordStat: WordStat) => {
    if (wordList === undefined) {
      return
    }
    // 优先更新数据
    setCorrectCount((count) => count + wordList[order].name.trim().length)
    // 记录错误数据
    if (everWrong) {
      setIncorrectInfo((prev) => [...prev, { word: wordList[order].name, translation: wordList[order].trans.join('；') }])
    }

    const wordStatUpload: WordStatUpload = {
      ...wordStat,
      order: order + 1,
      chapter: (currentChapter + 1).toString(),
      wordlist: currentDictInfo.name,
      modeDictation: !wordVisible,
      modeDark: isDarkMode,
      modeShuffle: randomConfig.isOpen,
      enabledKeyboardSound: keySoundsConfig.isOpen,
      enabledPhotonicsSymbol: phoneticConfig.isOpen,
      pronunciationAuto: pronunciationConfig.isOpen,
      pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
    }
    mixpanel.track('Word', wordStatUpload)

    // 更新正确率
    if (order === wordList.length - 1) {
      setIsStart(false)

      // 上传埋点数据
      const chapterStatUpload: ChapterStatUpload = {
        timeEnd: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
        duration: speedInfo.second + speedInfo.minute * 60,
        countInput: inputCount,
        countTypo: inputCount - correctCount,
        countCorrect: correctCount,
        chapter: (currentChapter + 1).toString(),
        wordlist: currentDictInfo.name,
        modeDictation: !wordVisible,
        modeDark: isDarkMode,
        modeShuffle: randomConfig.isOpen,
        enabledKeyboardSound: keySoundsConfig.isOpen,
        enabledPhotonicsSymbol: phoneticConfig.isOpen,
        pronunciationAuto: pronunciationConfig.isOpen,
        pronunciationOption: pronunciationConfig.isOpen === false ? 'none' : pronunciationConfig.type,
      }

      mixpanel.track('Chapter', chapterStatUpload)

      // 用户完成当前章节
      setResultScreenState(true)
    } else {
      setOrder((order) => order + 1)
    }

    // if user finished the word without skipping, then set skipState to false
    setIsShowSkip(false)
  }

  const addChapter = useCallback(() => {
    if (wordList === undefined) {
      return
    }
    setCurrentChapter((old) => old + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordList])

  const setDictation = useCallback((option: boolean) => {
    setWordVisible(!option)
    //dictation mode being set to 'true' indicates that the word is invisible.
  }, [])

  const repeatButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectInfo([])
    setOrder(0)
    setIsStart(true)
  }

  const invisibleButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectInfo([])
    setOrder(0)
    setIsStart(true)
    setDictation(true)
  }

  const nextButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectInfo([])
    addChapter()
    setOrder(0)
    setIsStart(true)
    setDictation(false)
  }

  return (
    <>
      {resultScreenState && (
        <ResultScreen
          incorrectInfo={incorrectInfo}
          speedInfo={speedInfo}
          repeatButtonHandler={repeatButtonHandler}
          invisibleButtonHandler={invisibleButtonHandler}
          nextButtonHandler={nextButtonHandler}
          exitButtonHandler={repeatButtonHandler}
        ></ResultScreen>
      )}
      {wordList === undefined ? (
        <Loading />
      ) : (
        <Layout>
          <Header>
            <Tooltip content="词典章节切换">
              <NavLink
                className="block rounded-lg px-4 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
                to="/gallery"
              >
                {currentDictInfo.name} 第 {currentChapter + 1} 章
              </NavLink>
            </Tooltip>
            <Tooltip content="发音切换">
              <PronunciationSwitcher />
            </Tooltip>
            <Switcher wordVisible={wordVisible} setWordVisible={setWordVisible} />
            <Tooltip content="快捷键 Enter">
              <button
                className={`${
                  isStart ? 'bg-gray-300 dark:bg-gray-700' : 'bg-indigo-400'
                }  flex w-20 items-center justify-center rounded-lg px-6 py-1 text-lg text-white transition-colors duration-300 focus:outline-none dark:text-opacity-80`}
                onClick={() => {
                  setIsStart((isStart) => !isStart)
                }}
              >
                {isStart ? 'Pause' : 'Start'}
              </button>
            </Tooltip>
            <Tooltip content="跳过该词">
              {/* because of the low frequency of the function, the button doesn't need a hotkey */}
              <button
                className={`${
                  isShowSkip ? 'bg-orange-400' : 'bg-gray-300'
                }  flex w-0 items-center justify-center rounded-lg py-1 text-lg text-white transition-all duration-300 focus:outline-none dark:text-opacity-80`}
                style={{
                  width: isShowSkip ? '80px' : '0px',
                  opacity: isShowSkip ? '1' : '0',
                  visibility: isShowSkip ? 'visible' : 'hidden',
                }}
                onClick={skipWord}
              >
                Skip
              </button>
            </Tooltip>
          </Header>
          <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-20">
            <div className="container relative mx-auto flex h-full flex-col items-center">
              <div className="h-1/3"></div>
              {!isStart && <h3 className="animate-pulse pb-4 text-xl text-gray-600 dark:text-gray-50">按任意键开始</h3>}
              {isStart && <CurrentWord word={wordList[order]} onFinish={onFinish} isStart={isStart} wordVisible={wordVisible} />}
              {isStart && <Progress order={order} wordsLength={wordList.length} />}
              <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} setSpeedInfo={setSpeedInfo} />
            </div>
          </div>
        </Layout>
      )}
    </>
  )
}

export default App
