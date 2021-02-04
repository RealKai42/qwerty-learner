import React, { useEffect, useState, useCallback, ChangeEvent, MouseEvent, useReducer } from 'react'
import _ from 'lodash'
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
import { useCookies } from 'react-cookie'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useSwitcherState from './Switcher/useSwitcherState'
import { useAppSettings } from 'components/AppSettings'
import Switcher from './Switcher'

import cet4 from 'assets/CET4_N.json'

const dicts: any = {
  cet4: ['CET-4', ''],
  cet6: ['CET-6', './dicts/CET6_N.json'],
  gmat: ['GMAT', './dicts/GMAT_N.json'],
  gre: ['GRE', './dicts/GRE_N.json'],
  ielts: ['IELTS', './dicts/IELTS_N.json'],
  kaoyan: ['考研', './dicts/KaoYan_N.json'],
  level4: ['专四', './dicts/Level4_N.json'],
  level8: ['专八', './dicts/Level8_N.json'],
  sat: ['SAT', './dicts/SAT_N.json'],
  toefl: ['TOEFL', './dicts/TOEFL_N.json'],
  coder: ['Coder Dict', './dicts/it-words.json'],
  jsArray: ['js-array', './dicts/js-array.json'],
  jsDate: ['js-date', './dicts/js-date.json'],
  jsGlobal: ['js-global', './dicts/js-global.json'],
  jsMapSet: ['js-map-set', './dicts/js-map-set.json'],
  jsMath: ['js-math', './dicts/js-math.json'],
  jsNumber: ['js-number', './dicts/js-number.json'],
  jsObject: ['js-object', './dicts/js-object.json'],
  jsPromise: ['js-promise', './dicts/js-promise.json'],
  jsString: ['js-string', './dicts/js-string.json'],
}

type WordType = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

const App: React.FC = () => {
  const chapterLength = 20

  const [order, setOrder] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dictName, setDictName] = useState<string>('cet4')
  const [dict, setDict] = useState<Array<WordType>>(cet4)

  const [inputCount, setInputCount] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isStart, setIsStart] = useState<boolean>(false)

  const [chapterListLength, setChapterListLength] = useState<number>(10)
  const [chapter, setChapter] = useState<number>(0)
  const [wordList, setWordList] = useState<Array<WordType>>(dict.slice(chapter * chapterLength, (chapter + 1) * chapterLength))

  const [cookies, setCookies] = useCookies()

  const [switcherState, switcherStateDispatch] = useSwitcherState({ wordVisible: true, phonetic: false })

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
    const cookieDict = cookies.dict
    const cookieChapter = parseInt(cookies.chapter)
    const cookieOrder = parseInt(cookies.order)
    if (cookieDict && cookieChapter) {
      setModalMessage(
        '提示',
        `您上次练习到字典 ${dicts[cookieDict][0]} 章节 ${cookieChapter + 1} 第${cookieOrder + 1}个单词 ，是否继续？`,
        '继续上次练习',
        '从头开始',
      )
      setModalHandler(
        () => {
          changeDict(cookieDict, cookieChapter)
          setOrder(cookieOrder)
          setModalState(false)
        },
        () => {
          setModalState(false)
        },
      )
      setModalState(true)
    }
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
    if (isStart) {
      window.addEventListener('blur', onBlur)
    }
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('blur', onBlur)
    }
  }, [isStart])

  useEffect(() => {
    setChapterListLength(Math.ceil(dict.length / chapterLength))
  }, [dict])

  useEffect(() => {
    setWordList(dict.slice(chapter * chapterLength, (chapter + 1) * chapterLength))
    setOrder(0)
  }, [dict, chapter])

  useEffect(() => {
    setCookies('chapter', chapter, { path: '/' })
    setCookies('dict', dictName, { path: '/' })
    setCookies('order', order, { path: '/' })
  }, [dictName, chapter, order, setCookies])

  const modalHandlerGenerator = (chapter: number, order: number, modalState: boolean) => {
    return () => {
      setOrder(order)
      setChapter(chapter)
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
      setCorrectCount((count) => count + dict[order].name.trim().length)
    }
  }

  const changeDict = (dictName: string, chaper: number = 0) => {
    setIsLoading(true)
    setDictName(dictName)

    if (dictName === 'cet4') {
      setDict(cet4)
      setChapter(chaper)
      setIsLoading(false)
    } else {
      fetch(dicts[dictName][1])
        .then((response) => response.json())
        .then((data) => {
          setDict(data)
          setChapter(chaper)
          setIsLoading(false)
        })
    }
  }

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
      {isLoading && <Loading />}
      <div className="h-screen w-full pb-4 flex flex-col items-center">
        <Header>
          <div>
            <select
              value={dictName}
              onChange={(e) => {
                changeDict(e.target.value)
                e.target.blur()
              }}
            >
              {Object.keys(dicts).map((key) => (
                <option value={key} key={key}>
                  {dicts[key][0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={chapter}
              onChange={(e) => {
                setChapter(parseInt(e.target.value))
                e.target.blur()
              }}
            >
              {_.range(chapterListLength).map((i) => {
                return (
                  <option value={i} key={i}>
                    Chap. {i + 1}
                  </option>
                )
              })}
            </select>
          </div>
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
