import React, { useEffect, useState, useCallback } from 'react'
import Header from 'components/Header'
import Main from 'components/Main'
import Footer from 'components/Footer'
import Word from 'components/Word'
import Translation from 'components/Translation'
import Speed from 'components/Speed'
import Modals from 'components/Modals'
import Loading from 'components/Loading'
import Phonetic from 'components/Phonetic'
import { isLegal } from 'utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import { useModals } from 'utils/hooks'
import useSwitcherState from './hooks/useSwitcherState'
import Switcher from './Switcher'
import DictSwitcher from './DictSwitcher'
import { dictList, useWordList } from './hooks/useWordList'
import { useLocalStorage } from 'react-use'

type LocalStorage = {
  dictName: string
  chapter: number
  order: number
}

const App: React.FC = () => {
  const chapterLength = 20

  const [order, setOrder] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)

  const [localStorage, setLocalStorage] = useLocalStorage<LocalStorage>('Dict')
  const [switcherState, switcherStateDispatch] = useSwitcherState({ wordVisible: true, phonetic: false })
  const [dictName, chapter, chapterListLength, wordList, wordListDispatch] = useWordList(chapterLength)

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
    // 首次加载时，读取 cookies
    if (localStorage) {
      const cookieDict = localStorage.dictName
      const cookieChapter = localStorage.chapter
      const cookieOrder = localStorage.order
      setModalMessage(
        '提示',
        `您上次练习到字典 ${dictList[cookieDict][0]} 章节 ${cookieChapter + 1} 第${cookieOrder + 1}个单词 ，是否继续？`,
        '继续上次练习',
        '从头开始',
      )
      setModalHandler(
        () => {
          changeDict(cookieDict)
          changeChapter(cookieChapter)
          setOrder(cookieOrder)
          setModalState(false)
        },
        () => {
          setModalState(false)
        },
      )
      setModalState(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    setLocalStorage({
      dictName,
      chapter,
      order: order,
    })
  }, [dictName, chapter, order, setLocalStorage])

  const modalHandlerGenerator = (chapter: number, order: number, modalState: boolean) => {
    return () => {
      setOrder(order)
      wordListDispatch('setChapter', chapter)
      setModalState(modalState)
    }
  }

  const onFinish = () => {
    if (order === wordList.length - 1) {
      // 用户完成当前章节
      if (chapter === chapterListLength - 1) {
        setModalState(true)
        setModalMessage('提示', '您已完成最后一个章节', '重复本章节', '重置到第一章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(chapter, 0, false), modalHandlerGenerator(0, 0, false), () => {
          modalHandlerGenerator(chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
        })
      } else {
        setModalState(true)
        setModalMessage('提示', '您已完成本章节', '下一章节', '重复本章节', '默写本章节')
        setThirdBtnHotkey('v')
        setModalHandler(modalHandlerGenerator(chapter + 1, 0, false), modalHandlerGenerator(chapter, 0, false), () => {
          modalHandlerGenerator(chapter, 0, false)()
          switcherStateDispatch('wordVisible', false)
        })
      }
    } else {
      setOrder((order) => order + 1)
      setCorrectCount((count) => count + wordList[order].name.trim().length)
    }
  }

  const changeDict = useCallback(
    (dictName: string) => {
      setOrder(0)
      setIsLoading(true)
      wordListDispatch('setDictName', dictName, () => {
        setIsLoading(false)
      })
    },
    [wordListDispatch],
  )

  const changeChapter = useCallback(
    (chapter: number) => {
      setOrder(0)
      wordListDispatch('setChapter', chapter)
    },
    [wordListDispatch],
  )

  return (
    <>
      {/* {console.log(wordList, order, wordList[order])} */}
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
      {isLoading && <Loading />}
      <div className="h-screen w-full pb-4 flex flex-col items-center">
        <Header>
          <DictSwitcher
            dictName={dictName}
            chapter={chapter}
            chapterListLength={chapterListLength}
            changeDict={changeDict}
            changeChapter={changeChapter}
          />
          <Switcher state={switcherState} dispatch={switcherStateDispatch} />
          <div className="group relative">
            <button
              className={`${
                isStart ? 'bg-gray-300' : 'bg-indigo-400'
              }  text-white text-lg  w-20 px-6 py-1 rounded-lg focus:outline-none flex items-center justify-center`}
              onClick={(e) => {
                setIsStart((isStart) => !isStart)
              }}
            >
              {isStart ? 'Pause' : 'Start'}
            </button>
            <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
              <span className="py-1 px-3 text-gray-500 text-xs">快捷键 Enter</span>
            </div>
          </div>
        </Header>

        <Main>
          <div className="container h-full relative flex mx-auto flex-col items-center">
            <div className="h-1/3"></div>
            <div>
              <Word
                key={`word-${wordList[order].name}`}
                word={wordList[order].name}
                onFinish={onFinish}
                isStart={isStart}
                wordVisible={switcherState.wordVisible}
              />

              {switcherState.phonetic && (wordList[order].usphone || wordList[order].ukphone) && (
                <Phonetic usphone={wordList[order].usphone} ukphone={wordList[order].ukphone} />
              )}
              <Translation key={`trans-${wordList[order].name}`} trans={wordList[order].trans.join('；')} />
            </div>

            <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} />
          </div>
        </Main>

        <Footer />
      </div>
    </>
  )
}

export default App
