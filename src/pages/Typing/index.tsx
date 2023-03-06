import React, { useCallback, useEffect, useState } from 'react'
import Header from '@/components/Header'
import Main from '@/components/Main'
import Word from '@/components/Word'
import Translation from '@/components/Translation'
import Speed from '@/components/Speed'
import Loading from '@/components/Loading'
import Phonetic from '@/components/Phonetic'
import PronunciationSwitcher from './PronunciationSwitcher'
import { isLegal, IsDesktop } from '@/utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import useSwitcherState from './hooks/useSwitcherState'
import Switcher from './Switcher'
import { useWordList, Word as WordType } from './hooks/useWordList'
import Layout from '../../components/Layout'
import { NavLink } from 'react-router-dom'
import usePronunciation from './hooks/usePronunciation'
import Tooltip from '@/components/Tooltip'
import { PronunciationType, useRandomState } from '@/store/AppState'
import Progress from './Progress'
import ResultScreen, { IncorrectInfo, ResultSpeedInfo } from '@/components/ResultScreen'
import mixpanel from 'mixpanel-browser'
import { ChapterStatUpload, WordStat, WordStatUpload } from '@/utils/statInfo'
import dayjs from 'dayjs'

const App: React.FC = () => {
  const [order, setOrder] = useState<number>(0)
  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)
  const [switcherState, switcherStateDispatch] = useSwitcherState({ wordVisible: true, phonetic: false })
  const wordList = useWordList()
  const [pronunciation, pronunciationDispatch] = usePronunciation()
  const [random] = useRandomState()
  const [wordsQueue, setWordsQueue] = useState<WordType[]>([])

  //props for ResultScreen
  const [resultScreenState, setResultScreenState] = useState<boolean>(false)
  const [incorrectInfo, setIncorrectInfo] = useState<IncorrectInfo[]>([])
  const [speedInfo, setSpeedInfo] = useState<ResultSpeedInfo>({ speed: '', minute: 0, second: 0 })

  useEffect(() => {
    // reset order when random change
    setOrder(0)
  }, [random])

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
      if (resultScreenState === false) {
        setIsStart((isStart) => !isStart)
      }
    },
    [resultScreenState],
  )

  useEffect(() => {
    //copy wordsQueue to wordsQueue
    if (wordList !== undefined) {
      setWordsQueue([...wordList.words])
    }
  }, [wordList?.words])

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (!resultScreenState) {
        if (isLegal(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
          if (isStart) {
            setInputCount((count) => count + 1)
          }
        }
        setIsStart(true)
      }
    }
    const onBlur = () => {
      if (isStart) {
        setIsStart(false)
      }
    }
    const hjOnclick = () => {
      setIsStart(false)
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('keydown', onKeydown)
    document.getElementsByClassName('_hj_feedback_container')[0]?.addEventListener('click', hjOnclick)

    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('blur', onBlur)
      document.getElementsByClassName('_hj_feedback_container')[0]?.removeEventListener('click', hjOnclick)
    }
  }, [isStart, resultScreenState])

  const skipWord = useCallback(() => {
    //skip current word and add it to the end of the wordQueue
    //store the wordsQueue[order] in a temp variable, then remove it from the queue, then add it to the end of the queue
    if (wordsQueue.length > 0) {
      const temp = wordsQueue[order]
      setWordsQueue((prev) => {
        const newWordsQueue = [...prev]
        newWordsQueue.splice(order, 1)
        return newWordsQueue
      })
      setWordsQueue((prev) => [...prev, temp])
    }
  }, [order, wordsQueue])
  // then all depending on wordsQueue[order] will have to move to wordQueue[order]

  const onFinish = (everWrong: boolean, wordStat: WordStat) => {
    if (wordList === undefined) {
      return
    }
    // 优先更新数据
    //setCorrectCount((count) => count + wordsQueue[order].name.trim().length)
    setCorrectCount((count) => count + wordsQueue[order].name.trim().length)
    // 记录错误数据
    if (everWrong) {
      //setIncorrectInfo((prev) => [...prev, { word: wordsQueue[order].name, translation: wordsQueue[order].trans.join('；') }])
      setIncorrectInfo((prev) => [...prev, { word: wordsQueue[order].name, translation: wordsQueue[order].trans.join('；') }])
    }

    const wordStatUpload: WordStatUpload = {
      ...wordStat,
      order: order + 1,
      chapter: (wordList.chapter + 1).toString(),
      wordlist: wordList.dictName,
      modeDictation: !switcherState.wordVisible,
      modeDark: switcherState.darkMode,
      modeShuffle: switcherState.random,
      enabledKeyboardSound: switcherState.sound,
      enabledPhotonicsSymbol: switcherState.phonetic,
      pronunciationAuto: pronunciation !== false,
      pronunciationOption: pronunciation === false ? 'none' : pronunciation,
    }
    mixpanel.track('Word', wordStatUpload)
    // 更新正确率
    if (order === wordsQueue.length - 1) {
      setIsStart(false)

      // 上传埋点数据
      const chapterStatUpload: ChapterStatUpload = {
        timeEnd: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
        duration: speedInfo.second + speedInfo.minute * 60,
        countInput: inputCount,
        countTypo: inputCount - correctCount,
        countCorrect: correctCount,
        chapter: (wordList.chapter + 1).toString(),
        wordlist: wordList.dictName,
        modeDictation: !switcherState.wordVisible,
        modeDark: switcherState.darkMode,
        modeShuffle: switcherState.random,
        enabledKeyboardSound: switcherState.sound,
        enabledPhotonicsSymbol: switcherState.phonetic,
        pronunciationAuto: pronunciation !== false,
        pronunciationOption: pronunciation === false ? 'none' : pronunciation,
      }

      mixpanel.track('Chapter', chapterStatUpload)

      // 用户完成当前章节
      setResultScreenState(true)
    } else {
      setOrder((order) => order + 1)
    }
  }

  const changePronunciation = useCallback(
    (state: PronunciationType) => {
      pronunciationDispatch(state)
    },
    [pronunciationDispatch],
  )

  const addChapter = useCallback(() => {
    if (wordList === undefined) {
      return
    }
    wordList.setChapterNumber(wordList.chapter + 1)
  }, [wordList])

  const setDictation = useCallback(
    (option) => {
      switcherStateDispatch('wordVisible', !option)
      //dictation mode being set to 'true' indicates that the word is invisible.
    },
    [switcherStateDispatch],
  )

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
                {wordList.dictName} 第 {wordList.chapter + 1} 章
              </NavLink>
            </Tooltip>
            <Tooltip content="发音切换">
              <PronunciationSwitcher
                state={pronunciation}
                languageConfig={{
                  // todo: use 'en' as default language maybe cause some unexpected error, add 'none'/null in the future
                  language: wordList?.language || 'en',
                  defaultPronIndex: wordList.defaultPronIndex,
                }}
                changePronunciationState={changePronunciation}
              />
            </Tooltip>
            <Switcher state={switcherState} dispatch={switcherStateDispatch} />
            <Tooltip content="快捷键 Enter">
              <button
                className={`${
                  isStart ? 'bg-gray-300 dark:bg-gray-700' : 'bg-indigo-400'
                }  flex w-20 items-center justify-center rounded-lg px-6 py-1 text-lg text-white transition-colors duration-300 focus:outline-none dark:text-opacity-80`}
                onClick={(e) => {
                  setIsStart((isStart) => !isStart)
                }}
              >
                {isStart ? 'Pause' : 'Start'}
              </button>
            </Tooltip>
            <Tooltip content="快捷键 Enter">
              <button
                className={`${
                  isStart ? 'bg-orange-400' : 'bg-gray-300'
                }  flex w-0 items-center justify-center rounded-lg py-1 text-lg text-white transition-all duration-200 focus:outline-none dark:text-opacity-80`}
                style={{
                  width: isStart ? '80px' : '0px',
                  opacity: isStart ? '1' : '0',
                  visibility: isStart ? 'visible' : 'hidden',
                }}
                onClick={(e) => {
                  //setIsStart((isStart) => !isStart)
                  skipWord()
                }}
              >
                Skip
              </button>
            </Tooltip>
          </Header>
          <Main>
            <div className="container relative mx-auto flex h-full flex-col items-center">
              <div className="h-1/3"></div>
              {!isStart && <h3 className="animate-pulse pb-4 text-xl text-gray-600 dark:text-gray-50">按任意键开始</h3>}
              {isStart && (
                <div className="flex flex-col items-center">
                  <Word
                    key={`word-${wordsQueue[order].name}-${order}`}
                    word={wordsQueue[order].name}
                    onFinish={onFinish}
                    isStart={isStart}
                    wordVisible={switcherState.wordVisible}
                  />
                  {switcherState.phonetic && (wordsQueue[order].usphone || wordsQueue[order].ukphone) && (
                    <Phonetic usphone={wordsQueue[order].usphone} ukphone={wordsQueue[order].ukphone} />
                  )}
                  <Translation key={`trans-${wordsQueue[order].name}`} trans={wordsQueue[order].trans.join('；')} />
                </div>
              )}
              {isStart && <Progress order={order} wordsLength={wordsQueue.length} />}
              <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} setSpeedInfo={setSpeedInfo} />
            </div>
          </Main>
        </Layout>
      )}
    </>
  )
}

export default App
