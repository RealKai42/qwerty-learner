import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import Tooltip from 'components/Tooltip'
import { useWordList } from 'pages/Typing/hooks/useWordList'
import { useState, useEffect } from 'react'

type ResultScreenProps = {
  speed: string
  timeString: string
  incorrectWords: string[]
  setIncorrectWords: React.Dispatch<React.SetStateAction<string[]>>
  incorrectTranslations: string[]
  setIncorrectTranslations: React.Dispatch<React.SetStateAction<string[]>>
  setResultScreenState: React.Dispatch<React.SetStateAction<boolean>>
  addChapter: () => void
  setInvisible: React.Dispatch<React.SetStateAction<boolean>>
  resetOrder: () => void
  setStart: React.Dispatch<React.SetStateAction<boolean>>
  setIsCorrectTable: React.Dispatch<React.SetStateAction<boolean[]>>
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  speed,
  timeString,
  incorrectWords,
  setIncorrectWords,
  incorrectTranslations,
  setIncorrectTranslations,
  setResultScreenState,
  addChapter,
  setInvisible,
  resetOrder,
  setStart,
  setIsCorrectTable,
}) => {
  const [chapterLength, setChapterLength] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [correctRate, setCorrectRate] = useState<number>(0)
  const [rootFontSize, setRootFontSize] = useState<number>(16)
  //collectList, boolean array
  const [collectList, setCollectList] = useState<boolean[]>([])
  //useState mistakeLevel, 0/1/2/3
  const [mistakeLevel, setMistakeLevel] = useState<number>(0)

  const wordList = useWordList()

  //useEffect detect and update the root font size
  useEffect(() => {
    const root = document.documentElement
    const fontSize = parseInt(window.getComputedStyle(root).getPropertyValue('font-size'))
    setRootFontSize(fontSize)
  }, [])

  //initialize collectList
  useEffect(() => {
    //initialize collectList, length equals to incorrectWords.length, default all true
    const collectList = new Array(incorrectWords.length).fill(true)
    setCollectList(collectList)
    //update mistakeLevel based on corectRate, 0:100%, 1:90%, 2:70%, 3:50%
    if (correctRate >= 90) {
      setMistakeLevel(0)
    } else if (correctRate >= 70) {
      setMistakeLevel(1)
    } else if (correctRate >= 50) {
      setMistakeLevel(2)
    } else {
      setMistakeLevel(3)
    }
  }, [incorrectWords, correctRate])

  useEffect(() => {
    setChapterLength(wordList?.words.length || 0)
    setCorrectCount((wordList?.words.length || 0) - incorrectWords.length)
  }, [wordList, incorrectWords])

  useEffect(() => {
    setCorrectRate(Math.floor((correctCount / chapterLength) * 100))
  }, [correctCount, chapterLength])

  const dictNameCombined: string = wordList ? `${wordList.dictName}  第${wordList.chapter + 1}章` : ' '

  const lastChapter = () => {
    if (wordList) {
      return wordList.chapter === wordList.chapterListLength - 1
    } else {
      return false
    }
  }

  const conclusionIcon = () => {
    switch (mistakeLevel) {
      case 0:
        return <FontAwesomeIcon icon={['fas', 'heart']} className="text-indigo-600 pt-2" size="lg" />
      case 1:
        return <FontAwesomeIcon icon={['fas', 'thumbs-up']} className="text-indigo-600 pt-2" size="lg" />
      case 2:
        return <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-indigo-600 pt-2" size="lg" />
      default:
        return <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-indigo-600 pt-2" size="lg" />
    }
  }

  const conclusionText = () => {
    switch (mistakeLevel) {
      case 0:
        return <div className="font-semibold text-lg ml-2 pt-1">表现不错！只错了 {incorrectWords.length} 个单词</div>
      case 1:
        return <div className="font-semibold text-lg ml-2 pt-1">有些小问题哦，下一次可以做得更好！</div>
      case 2:
        return <div className="font-semibold text-lg ml-2 pt-1">错误太多，再来一次如何？</div>
      default:
        return <div className="font-semibold text-lg ml-2 pt-1">错误太多，再来一次如何？</div>
    }
  }

  const disabledClassName: string = lastChapter() ? 'cursor-not-allowed opacity-50' : ''

  const repeatButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectWords([])
    setIncorrectTranslations([])
    setIsCorrectTable([])
    resetOrder()
    setStart(true)
  }

  const invisibleButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectWords([])
    setIncorrectTranslations([])
    setIsCorrectTable([])
    resetOrder()
    setStart(true)
    setInvisible(true)
  }

  const nextButtonHandler = () => {
    setResultScreenState(false)
    setIncorrectWords([])
    setIncorrectTranslations([])
    setIsCorrectTable([])
    addChapter()
    resetOrder()
    setStart(true)
  }

  //wordCard onlick handler, change the index of collectList value to opposite, MouseEventHandler
  const wordCardOnClickHandler = (index: number) => {
    const newCollectList = [...collectList]
    newCollectList[index] = !newCollectList[index]
    setCollectList(newCollectList)
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-300 opacity-80"></div>
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
          <div className="w-3/5 h-2/3 card bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-lg fixed flex flex-col overflow-hidden">
            <div className="text-center mt-10 font-sans font-semibold text-2xl">{dictNameCombined}</div>

            <div className="flex flex-row gap-2 mt-10 overflow-hidden mx-10">
              <div className="flex flex-col gap-3 flex-grow-0 w-40 px-6">
                <div>
                  <svg className="w-28 h-28">
                    <circle
                      className="text-indigo-200"
                      stroke-width="8"
                      stroke="currentColor"
                      fill="transparent"
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
                      fill="transparent"
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
                      fill="transparent"
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
                <div className="flex flex-row gap-4 flex-wrap overflow-y-auto customized-scrollbar h-80 content-start ml-8 mr-1 pt-9">
                  {incorrectWords.map((word, index) => {
                    return (
                      <Tooltip content={`${incorrectTranslations[index]}`}>
                        <div
                          className={`${
                            collectList[index] ? 'border-indigo-600' : 'border-indigo-300'
                          } border-solid border-2 rounded-md bg-white hover:bg-indigo-100 w-auto h-12 px-5 py-1 flex flex-row gap-3 cursor-pointer transition-colors duration-100`}
                          onClick={(e) => wordCardOnClickHandler(index)}
                        >
                          <div className="font-mono text-3xl">{word}</div>
                          <FontAwesomeIcon
                            icon={['fas', 'circle-check']}
                            className={`${collectList[index] ? 'text-indigo-600' : 'text-indigo-300'} pt-2`}
                            size="lg"
                          />
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
                <div className="bg-indigo-200 w-full h-10 rounded-b-lg flex flex-row px-4">
                  <>
                    {conclusionIcon()}
                    {conclusionText()}
                  </>
                  <div className="ml-auto flex flex-row gap-5 items-center text-lg font-semibold">
                    <div>
                      已选 {collectList.filter((item) => item).length}/{incorrectWords.length}
                    </div>
                    <Tooltip content="即将上线，敬请期待">
                      <div className="text-indigo-500 hover:text-indigo-700 transition-colors duration-100 cursor-not-allowed">
                        加入单词簿
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-10 gap-5 px-5 text-xl">
              <button
                className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400"
                onClick={invisibleButtonHandler}
              >
                默写本章节
              </button>
              <button
                className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400 "
                onClick={repeatButtonHandler}
              >
                重复本章节
              </button>
              <button
                className={`rounded-md bg-indigo-400 hover:bg-indigo-600 px-6 py-2 font-semibold transition-colors duration-100 ${disabledClassName}`}
                onClick={nextButtonHandler}
                disabled={lastChapter()}
              >
                下一章节
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default ResultScreen
