import React, { useCallback, useEffect, useState } from 'react'
import Header from 'components/Header'
import Main from 'components/Main'
import Word from 'components/Word'
import Translation from 'components/Translation'
import Speed from 'components/Speed'
import Modals from 'components/Modals'
import Loading from 'components/Loading'
import Phonetic from 'components/Phonetic'
import PronunciationSwitcher from './PronunciationSwitcher'
import { isLegal, IsDesktop } from 'utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import { useModals } from 'hooks/useModals'
import useSwitcherState from './hooks/useSwitcherState'
import Switcher from './Switcher'
import { useWordList } from './hooks/useWordList'
import Layout from '../../components/Layout'
import { NavLink } from 'react-router-dom'
import usePronunciation from './hooks/usePronunciation'
import Tooltip from 'components/Tooltip'
import { useRandomState } from 'store/AppState'
import Progress from './Progress'

const App: React.FC = () => {
  const [order, setOrder] = useState<number>(0)

  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)

  const [switcherState, switcherStateDispatch] = useSwitcherState({ wordVisible: true, phonetic: false })
  const wordList = useWordList()
  const [pronunciation, pronunciationDispatch] = usePronunciation()
  const [random] = useRandomState()

  const {
    modalState,
    title: modalTitle,
    content: modalContent,
    firstButton: modalFirstBtn,
    secondButton: modalSecondBtn,
    thirdButton: modalThirdBtn,
    thirdBtnHotkey,
    setThirdBtnHotkey,
    firstButtonOnclick: modalFirstBtnOnclick,
    secondButtonOnclick: modalSecondBtnOnclick,
    thirdButtonOnclick: modalThirdBtnOnclick,
    setModalState,
    setMessage: setModalMessage,
    setHandler: setModalHandler,
  } = useModals(false, '提示')

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
      if (modalState === false) {
        setIsStart((isStart) => !isStart)
      }
    },
    [modalState],
  )

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (isLegal(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (isStart) {
          setInputCount((count) => count + 1)
        }
      }
      setIsStart(true)
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
  }, [isStart])

  const modalHandlerGenerator = (chapter: number, order: number, modalState: boolean) => {
    return () => {
      setOrder(order)
      wordList?.setChapterNumber(chapter)
      setModalState(modalState)
      setIsStart(true)
    }
  }

  const onFinish = () => {
    if (wordList === undefined) {
      return
    }
    // 优先更新数据
    setCorrectCount((count) => count + wordList.words[order].name.trim().length)
    if (switcherState.loop) {
      return
    }
    if (order === wordList.words.length - 1) {
      setIsStart(false)
      // 用户完成当前章节
      if (wordList.chapter === wordList.chapterListLength - 1) {
        setModalState(true)
        setModalMessage('提示', '您已完成最后一个章节', '重置到第一章节', '重复本章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(0, 0, false), modalHandlerGenerator(wordList.chapter, 0, false), () => {
          modalHandlerGenerator(wordList.chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
          setIsStart(true)
        })
      } else {
        setModalState(true)
        setModalMessage('提示', '您已完成本章节', '下一章节', '重复本章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(wordList.chapter + 1, 0, false), modalHandlerGenerator(wordList.chapter, 0, false), () => {
          modalHandlerGenerator(wordList.chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
          setIsStart(true)
        })
      }
    } else {
      setOrder((order) => order + 1)
    }
  }

  const changePronunciation = useCallback(
    (state: string) => {
      pronunciationDispatch(state)
    },
    [pronunciationDispatch],
  )

  return (
    <>
      {modalState && (
        <Modals
          state={modalState}
          title={modalTitle}
          content={modalContent}
          firstButton={modalFirstBtn}
          secondButton={modalSecondBtn}
          thirdButton={modalThirdBtn}
          thirdButtonHotkey={thirdBtnHotkey}
          firstButtonOnclick={modalFirstBtnOnclick}
          secondButtonOnclick={modalSecondBtnOnclick}
          thirdButtonOnclick={modalThirdBtnOnclick}
        />
      )}
      {wordList === undefined ? (
        <Loading />
      ) : (
        <Layout>
          <Header>
            <Tooltip content="词典章节切换">
              <NavLink
                className="text-lg px-4 py-1 rounded-lg transition-colors duration-300 ease-in-out focus:outline-none dark:text-white dark:text-opacity-60 hover:bg-indigo-400 hover:text-white dark:hover:text-opacity-100"
                to="/gallery"
              >
                {wordList.dictName} 第 {wordList.chapter + 1} 章
              </NavLink>
            </Tooltip>
            <Tooltip content="发音切换">
              <PronunciationSwitcher state={pronunciation.toString()} changePronunciationState={changePronunciation} />
            </Tooltip>
            <Switcher state={switcherState} dispatch={switcherStateDispatch} />
            <Tooltip content="快捷键 Enter">
              <button
                className={`${
                  isStart ? 'bg-gray-300 dark:bg-gray-700' : 'bg-indigo-400'
                }  text-white dark:text-opacity-80 transition-colors duration-300 text-lg w-20 px-6 py-1 rounded-lg focus:outline-none flex items-center justify-center`}
                onClick={(e) => {
                  setIsStart((isStart) => !isStart)
                }}
              >
                {isStart ? 'Pause' : 'Start'}
              </button>
            </Tooltip>
          </Header>
          <Main>
            <div className="container h-full relative flex mx-auto flex-col items-center">
              <div className="h-1/3"></div>
              {!isStart && <h3 className="pb-4 text-xl text-gray-600 dark:text-gray-50 animate-pulse">按任意键开始</h3>}
              {isStart && (
                <div>
                  <Word
                    key={`word-${wordList.words[order].name}-${order}`}
                    word={wordList.words[order].name}
                    onFinish={onFinish}
                    isStart={isStart}
                    isLoop={switcherState.loop}
                    wordVisible={switcherState.wordVisible}
                  />
                  {switcherState.phonetic && (wordList.words[order].usphone || wordList.words[order].ukphone) && (
                    <Phonetic usphone={wordList.words[order].usphone} ukphone={wordList.words[order].ukphone} />
                  )}
                  <Translation key={`trans-${wordList.words[order].name}`} trans={wordList.words[order].trans.join('；')} />
                </div>
              )}
              {isStart && <Progress order={order} wordsLength={wordList.words.length} />}
              <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} />
            </div>
          </Main>
        </Layout>
      )}
    </>
  )
}

export default App
