import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import { useWordList } from 'pages/Typing/hooks/useWordList'
import { useState, useEffect } from 'react'

type ResultScreenProps = {
  speed: string
  timeString: string
  correctFlag: number[]
  setCorrectFlag: React.Dispatch<React.SetStateAction<number[]>>
  incorrectWords: string[]
  setIncorrectWords: React.Dispatch<React.SetStateAction<string[]>>
  incorrectTranslations: string[]
  setIncorrectTranslations: React.Dispatch<React.SetStateAction<string[]>>
  setResultScreenState: React.Dispatch<React.SetStateAction<boolean>>
  addChapter: () => void
  setInvisible: React.Dispatch<React.SetStateAction<boolean>>
  resetOrder: () => void
  setStart: React.Dispatch<React.SetStateAction<boolean>>
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  speed,
  timeString,
  correctFlag,
  setCorrectFlag,
  incorrectWords,
  setIncorrectWords,
  incorrectTranslations,
  setIncorrectTranslations,
  setResultScreenState,
  addChapter,
  setInvisible,
  resetOrder,
  setStart,
}) => {
  const [chapterLength, setChapterLength] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [incorrectCount, setIncorrectCount] = useState<number>(0)
  const [multiIncorrectCount, setMultiIncorrectCount] = useState<number>(0)
  const [correctRate, setCorrectRate] = useState<number>(0)
  const [correctRateColor, setCorrectRateColor] = useState<string>('text-green-500')
  const [widthPercent, setWidthPercent] = useState<number>(0)

  const wordList = useWordList()

  useEffect(() => {
    setChapterLength(correctFlag.length)
    setCorrectCount(correctFlag.filter((flag) => flag === 0).length)
    setIncorrectCount(correctFlag.filter((flag) => flag === 1).length)
    setMultiIncorrectCount(correctFlag.filter((flag) => flag === 2).length)
  }, [correctFlag])

  useEffect(() => {
    setCorrectRate(Math.floor((correctCount / chapterLength) * 100))
  }, [correctCount, chapterLength])

  useEffect(() => {
    setCorrectRateColor(
      correctRate === 100
        ? 'text-green-500'
        : correctRate >= 90
        ? 'text-green-400'
        : correctRate >= 80
        ? 'text-green-300'
        : correctRate >= 70
        ? 'text-yellow-300'
        : correctRate >= 60
        ? 'text-yellow-400'
        : 'text-red-500',
    )

    setWidthPercent(Math.ceil(100 / chapterLength))
  }, [correctRate, chapterLength])

  const progressUnits = correctFlag.map((flag, index) => {
    if (flag) {
      return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-lg bg-red-500`}></div>
    } else {
      if (index === 0) {
        if (correctFlag[index + 1]) {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-r-lg bg-green-400`}></div>
        } else {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 bg-green-400`}></div>
        }
      } else if (index === chapterLength - 1) {
        if (correctFlag[index - 1]) {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-l-lg bg-green-400`}></div>
        } else {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 bg-green-400`}></div>
        }
      } else {
        if (correctFlag[index - 1] && correctFlag[index + 1]) {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-lg bg-green-400`}></div>
        } else if (correctFlag[index - 1]) {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-l-lg bg-green-400`}></div>
        } else if (correctFlag[index + 1]) {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 rounded-r-lg bg-green-400`}></div>
        } else {
          return <div key={index} style={{ width: `${widthPercent}%` }} className={`h-6 bg-green-400`}></div>
        }
      }
    }
  })

  const wordCards = incorrectWords.map((word, index) => {
    const wordLength = word.length
    const translationLength = incorrectTranslations[index].length
    const fontSize = wordLength > 9 ? 'text-4xl' : 'text-5xl'
    const pt = wordLength > 9 ? 'pt-8' : 'pt-10'

    const translationFontSize = translationLength > 20 ? 'text-md' : translationLength > 10 ? 'text-xl' : 'text-2xl'
    return (
      <div className="w-full h-44 rounded-lg overflow-hidden bg-white" key={index}>
        <div className={`flex flex-col ${pt} gap-2 overflow-hidden`}>
          <div className={`font-mono px-2 w-full text-center ${fontSize}`}>{word}</div>
          <div className={`w-full px-2 text-center font-semibold ${translationFontSize}`}>{incorrectTranslations[index]}</div>
        </div>
      </div>
    )
  })

  const nextChapter: string =
    wordList && wordList.chapter < wordList.chapterListLength - 1 ? `${wordList.dictName} 第${wordList.chapter + 2}章` : '已完成所有章节'

  const dictNameCombined: string = wordList ? `${wordList.dictName}  第${wordList.chapter + 1}章` : ' '

  const lastChapter = () => {
    if (wordList) {
      return wordList.chapter === wordList.chapterListLength - 1
    } else {
      return false
    }
  }

  const disabledClassName: string = lastChapter() ? 'cursor-not-allowed opacity-50' : ''

  const repeatButtonHandler = () => {
    setResultScreenState(false)
    setCorrectFlag([])
    setIncorrectWords([])
    setIncorrectTranslations([])
    resetOrder()
    setStart(true)
  }

  const invisibleButtonHandler = () => {
    setResultScreenState(false)
    setCorrectFlag([])
    setIncorrectWords([])
    setIncorrectTranslations([])
    resetOrder()
    setStart(true)
    setInvisible(true)
  }

  const nextButtonHandler = () => {
    setResultScreenState(false)
    setCorrectFlag([])
    setIncorrectWords([])
    setIncorrectTranslations([])
    addChapter()
    resetOrder()
    setStart(true)
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
            {/* <div className="flex gap-10 md:gap-8 sm:gap-6 mt-1 mx-14">
              <div className="flex flex-col text-center">
                <div className={`font-mono text-5xl ${correctRateColor}`}>{correctRate}%</div>
                <div className="">正确率</div>
              </div>
              <div className="overflow-hidden h-6 w-full rounded-large bg-green-100 mt-4">
                <div className="flex">{progressUnits}</div>
              </div>
            </div> */}

            <div className="flex flex-row gap-2 mt-10 overflow-hidden mx-7">
              <div className="flex flex-col gap-3 flex-grow-0 w-40 px-6">
                <div>
                  <svg className="w-32 h-32">
                    <circle
                      className="text-indigo-200"
                      stroke-width="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                    />
                    <text x="4rem" y="3.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="2.25rem">
                      85%
                    </text>
                    <text x="4rem" y="5.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.25rem">
                      正确率
                    </text>
                    <circle
                      className="text-indigo-500"
                      stroke-width="10"
                      stroke-dasharray="25.12rem"
                      stroke-dashoffset="10rem"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                      transform="rotate(-90 4rem 4rem)"
                    />
                  </svg>
                </div>
                <div>
                  <svg className="w-32 h-32">
                    <circle
                      className="text-indigo-200"
                      stroke-width="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                    />
                    <text x="4rem" y="3.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="2.25rem">
                      85%
                    </text>
                    <text x="4rem" y="5.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.25rem">
                      正确率
                    </text>
                    <circle
                      className="text-indigo-500"
                      stroke-width="10"
                      stroke-dasharray="25.12rem"
                      stroke-dashoffset="10rem"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                      transform="rotate(-90 4rem 4rem)"
                    />
                  </svg>
                </div>
                <div>
                  <svg className="w-32 h-32">
                    <circle
                      className="text-indigo-200"
                      stroke-width="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                    />
                    <text x="4rem" y="3.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="2.25rem">
                      85%
                    </text>
                    <text x="4rem" y="5.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.25rem">
                      正确率
                    </text>
                    <circle
                      className="text-indigo-500"
                      stroke-width="10"
                      stroke-dasharray="25.12rem"
                      stroke-dashoffset="10rem"
                      stroke="currentColor"
                      fill="transparent"
                      r="3.5rem"
                      cx="4rem"
                      cy="4rem"
                      transform="rotate(-90 4rem 4rem)"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-50 flex-grow mx-10 px-6 py-5">
                <div className="flex flex-row gap-4 flex-wrap overflow-y-auto customized-scrollbar h-96">
                  <div className="border-indigo-500 border-solid border-2 rounded-md bg-white hover:bg-indigo-100 w-auto h-12 px-5 py-1 flex flex-row gap-3 cursor-pointer transition-colors duration-100">
                    <div className="font-mono text-3xl">test</div>
                    <FontAwesomeIcon icon={['fas', 'circle-check']} className="text-indigo-600 pt-2" size="lg" />
                  </div>
                  <div className="border-indigo-300 border-solid border-2 rounded-md bg-white w-auto h-12 px-5 py-1 flex flex-row gap-3">
                    <div className="font-mono text-3xl">test</div>
                    <FontAwesomeIcon icon={['fas', 'circle-check']} className="text-indigo-400 pt-2" size="lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-2 gap-5 px-5 text-xl">
              <button
                className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400"
                onClick={invisibleButtonHandler}
              >
                默写本章
              </button>
              <button
                className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 font-semibold transition-colors duration-100 border-solid border-2 border-indigo-400 "
                onClick={repeatButtonHandler}
              >
                重复本章
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
