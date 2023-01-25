import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import Tooltip from 'components/Tooltip'
import { useWordList } from 'pages/Typing/hooks/useWordList'
import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type ResultScreenProps = {
  speed: string
  timeString: string
  incorrectWords: string[]
  incorrectTranslations: string[]
  repeatButtonHandler: () => void
  invisibleButtonHandler: () => void
  nextButtonHandler: () => void
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  speed,
  timeString,
  incorrectWords,
  incorrectTranslations,
  repeatButtonHandler,
  invisibleButtonHandler,
  nextButtonHandler,
}) => {
  const [chapterLength, setChapterLength] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [correctRate, setCorrectRate] = useState<number>(0)
  const [rootFontSize, setRootFontSize] = useState<number>(16) //for svg circle rotate parameter
  const [collectList, setCollectList] = useState<boolean[]>([])
  const [mistakeLevel, setMistakeLevel] = useState<number>(0)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false) //for svg fill color switch

  const wordList = useWordList()

  //useEffect detect and update the root font size
  useEffect(() => {
    const root = document.documentElement
    const fontSize = parseInt(window.getComputedStyle(root).getPropertyValue('font-size'))
    setRootFontSize(fontSize)
  }, [])

  useEffect(() => {
    //detect dark mode
    const darkMode = document.documentElement.classList.contains('dark')
    setIsDarkMode(darkMode)
  }, [])

  //initialize collectList
  useEffect(() => {
    const collectList = new Array(incorrectWords.length).fill(true)
    setCollectList(collectList)
    if (correctRate >= 90) {
      setMistakeLevel(0)
    } else if (correctRate >= 70) {
      setMistakeLevel(1)
    } else {
      setMistakeLevel(2)
    }
  }, [incorrectWords, correctRate])

  useEffect(() => {
    setChapterLength(wordList?.words.length || 0)
    setCorrectCount((wordList?.words.length || 0) - incorrectWords.length)
  }, [wordList, incorrectWords])

  useEffect(() => {
    setCorrectRate(Math.floor((correctCount / chapterLength) * 100))
  }, [correctCount, chapterLength]) //update correctRate

  const dictNameCombined: string = wordList ? `${wordList.dictName}  第${wordList.chapter + 1}章` : ' '

  const lastChapter = () => {
    if (wordList) {
      return wordList.chapter === wordList.chapterListLength - 1
    } else {
      return false
    }
  } //check if it is the last chapter

  const conclusion = () => {
    switch (mistakeLevel) {
      case 0:
        return (
          <>
            <FontAwesomeIcon icon={['fas', 'heart']} className="text-indigo-600 pt-2" size="lg" />
            <div className="font-semibold text-lg ml-2 pt-1">表现不错！只错了 {incorrectWords.length} 个单词</div>
          </>
        )
      case 1:
        return (
          <>
            <FontAwesomeIcon icon={['fas', 'thumbs-up']} className="text-indigo-600 pt-2" size="lg" />
            <div className="font-semibold text-lg ml-2 pt-1">有些小问题哦，下一次可以做得更好！</div>
          </>
        )
      case 2:
        return (
          <>
            <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-indigo-600 pt-2" size="lg" />
            <div className="font-semibold text-lg ml-2 pt-1">错误太多，再来一次如何？</div>
          </>
        )
    }
  }

  const disabledClassName: string = lastChapter() ? 'cursor-not-allowed opacity-50' : ''

  useHotkeys('enter', () => {
    //if last chapter, do nothing
    if (lastChapter()) {
      return
    } else {
      nextButtonHandler()
    }
  })

  useHotkeys('space', () => {
    repeatButtonHandler()
  })

  useHotkeys('shift+space', () => {
    invisibleButtonHandler()
  })

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 opacity-80"></div>
      <Transition
        show={true}
        enter="ease-in duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-out duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex items-center justify-center h-screen">
          <div className="w-3/5 h-2/3 card bg-white dark:bg-gray-800 rounded-3xl shadow-lg fixed flex flex-col overflow-hidden">
            <div className="text-center mt-10 font-sans font-semibold text-2xl dark:text-white">{dictNameCombined}</div>

            <div className="flex flex-row gap-2 mt-10 overflow-hidden mx-10">
              <div className="flex flex-col gap-3 flex-grow-0 w-40 px-4">
                <div>
                  <svg className="w-28 h-28">
                    <circle
                      className="text-indigo-200"
                      stroke-width="8"
                      stroke="currentColor"
                      fill={isDarkMode ? 'white' : 'transparent'}
                      r="3.1rem"
                      cx="3.5rem"
                      cy="3.5rem"
                    />
                    <text x="3.5rem" y="3.2rem" textAnchor="middle" dominantBaseline="middle" fontSize="2rem">
                      {correctRate}%
                    </text>
                    <text x="3.5rem" y="4.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="1rem">
                      正确率
                    </text>
                    <circle
                      className="text-indigo-400"
                      stroke-width="8"
                      stroke-dasharray="19.6rem"
                      stroke-dashoffset={`${(100 - correctRate) * (19.6 / 100)}rem`}
                      stroke="currentColor"
                      fill="transparent"
                      r="3.1rem"
                      cx="3.5rem"
                      cy="3.5rem"
                      transform={`rotate(-90 ${3.5 * rootFontSize} ${3.5 * rootFontSize})`}
                    />
                  </svg>
                </div>
                <div>
                  <svg className="w-28 h-28">
                    <circle
                      className="text-indigo-200"
                      stroke-width="8"
                      stroke="currentColor"
                      fill={isDarkMode ? 'white' : 'transparent'}
                      r="3.1rem"
                      cx="3.5rem"
                      cy="3.5rem"
                    />
                    <text x="3.5rem" y="3.25rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.5rem">
                      {timeString}
                    </text>
                    <text x="3.5rem" y="4.75rem" textAnchor="middle" dominantBaseline="middle" fontSize="1rem">
                      章节耗时
                    </text>
                  </svg>
                </div>
                <div>
                  <svg className="w-28 h-28">
                    <circle
                      className="text-indigo-200"
                      stroke-width="8"
                      stroke="currentColor"
                      fill={isDarkMode ? 'white' : 'transparent'}
                      r="3.1rem"
                      cx="3.5rem"
                      cy="3.5rem"
                    />
                    <text x="3.5rem" y="3.25rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.5rem">
                      {speed}个/s
                    </text>
                    <text x="3.5rem" y="4.75rem" textAnchor="middle" dominantBaseline="middle" fontSize="1rem">
                      输入字符
                    </text>
                  </svg>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-50 flex-grow mx-6 overflow-hidden">
                <div className="flex flex-row gap-4 flex-wrap overflow-y-auto overflow-x-hidden customized-scrollbar h-80 content-start ml-8 mr-1 pr-7 pt-9">
                  {incorrectWords.map((word, index) => {
                    return (
                      <Tooltip content={`${incorrectTranslations[index]}`}>
                        <div
                          className={`${
                            collectList[index] ? 'border-indigo-600' : 'border-indigo-300'
                          } border-solid border-2 rounded-md bg-white hover:bg-indigo-100 w-auto h-12 px-5 py-1 flex flex-row gap-3 cursor-pointer transition-colors duration-100`}
                        >
                          <div className="font-mono text-3xl">{word}</div>
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
                <div className="bg-indigo-200 w-full h-10 rounded-b-lg flex flex-row px-4">
                  <>{conclusion()}</>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-10 gap-5 px-5 text-xl">
              <Tooltip content="快捷键：shift + enter">
                <button
                  className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400"
                  onClick={invisibleButtonHandler}
                >
                  默写本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：space">
                <button
                  className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400 "
                  onClick={repeatButtonHandler}
                >
                  重复本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：enter">
                <button
                  className={`rounded-md bg-indigo-400 hover:bg-indigo-600 px-6 py-2 font-semibold transition-colors duration-100 ${disabledClassName}`}
                  onClick={nextButtonHandler}
                  disabled={lastChapter()}
                >
                  下一章节
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default ResultScreen
