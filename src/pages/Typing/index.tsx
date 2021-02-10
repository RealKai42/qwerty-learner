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
import { isLegal } from 'utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import { useModals } from 'hooks/useModals'
import useSwitcherState from './hooks/useSwitcherState'
import Switcher from './Switcher'
import { useWordList } from './hooks/useWordList'
import Layout from '../../components/Layout'
import { NavLink } from 'react-router-dom'
import usePronunciation from './hooks/usePronunciation'

const App: React.FC = () => {
  const [order, setOrder] = useState<number>(0)

  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)

  const [switcherState, switcherStateDispatch] = useSwitcherState({ wordVisible: true, phonetic: false })
  const wordList = useWordList()
  const [pronunciation, pronunciationDispatch] = usePronunciation()

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
        } else {
          setIsStart(true)
        }
      }
    }
    const onBlur = () => {
      if (isStart) {
        setIsStart(false)
      }
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('blur', onBlur)
    }
  }, [isStart])

  const modalHandlerGenerator = (chapter: number, order: number, modalState: boolean) => {
    return () => {
      setOrder(order)
      wordList?.setChapterNumber(chapter)
      setModalState(modalState)
    }
  }

  const onFinish = () => {
    if (wordList === undefined) {
      return
    }
    if (order === wordList.words.length - 1) {
      // 用户完成当前章节
      if (wordList.chapter === wordList.chapterListLength - 1) {
        setModalState(true)
        setModalMessage('提示', '您已完成最后一个章节', '重复本章节', '重置到第一章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(wordList.chapter, 0, false), modalHandlerGenerator(0, 0, false), () => {
          modalHandlerGenerator(wordList.chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
        })
      } else {
        setModalState(true)
        setModalMessage('提示', '您已完成本章节', '下一章节', '重复本章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(wordList.chapter + 1, 0, false), modalHandlerGenerator(wordList.chapter, 0, false), () => {
          modalHandlerGenerator(wordList.chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
        })
      }
    } else {
      setOrder((order) => order + 1)
      setCorrectCount((count) => count + wordList.words[order].name.trim().length)
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
            <div className="group relative">
              <NavLink
                className="text-lg px-4 py-1 rounded-lg transition-colors duration-300 ease-in-out focus:outline-none dark:text-white dark:text-opacity-60 hover:bg-indigo-400 hover:text-opacity-100"
                to="/gallery"
              >
                {wordList.dictName} 第 {wordList.chapter + 1} 章
              </NavLink>
              <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-0 flex items-center justify-center">
                <span className="py-1 px-3 text-gray-500 dark:text-gray-400 text-xs">词典章节切换</span>
              </div>
            </div>
            <PronunciationSwitcher state={pronunciation.toString()} changePronunciationState={changePronunciation} />
            <Switcher state={switcherState} dispatch={switcherStateDispatch} />
            <div className="group relative">
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
              <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
                <span className="py-1 px-3 text-gray-500 dark:text-gray-400 text-xs">快捷键 Enter</span>
              </div>
            </div>
          </Header>
          <Main>
            <div className="container h-full relative flex mx-auto flex-col items-center">
              <div className="h-1/3"></div>
              <div>
                <Word
                  key={`word-${wordList.words[order].name}`}
                  word={wordList.words[order].name}
                  onFinish={onFinish}
                  isStart={isStart}
                  wordVisible={switcherState.wordVisible}
                />
                {switcherState.phonetic && (wordList.words[order].usphone || wordList.words[order].ukphone) && (
                  <Phonetic usphone={wordList.words[order].usphone} ukphone={wordList.words[order].ukphone} />
                )}
                <Translation key={`trans-${wordList.words[order].name}`} trans={wordList.words[order].trans.join('；')} />
              </div>
              <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} />
            </div>
          </Main>
        </Layout>
      )}
    </>
  )
}

export default App
