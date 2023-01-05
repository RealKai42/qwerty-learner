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
          <div className="w-3/5 h-2/3 card bg-white dark:bg-gray-800 dark:text-white rounded-large shadow-lg fixed flex flex-col overflow-hidden">
            <div className="text-center mt-5 font-sans font-semibold text-2xl">{dictNameCombined}</div>
            <div className="flex gap-10 md:gap-8 sm:gap-6 mt-1 mx-14">
              <div className="flex flex-col text-center">
                <div className={`font-mono text-5xl ${correctRateColor}`}>{correctRate}%</div>
                <div className="">正确率</div>
              </div>
              <div className="overflow-hidden h-6 w-full rounded-large bg-green-100 mt-4">
                <div className="flex">{progressUnits}</div>
              </div>
            </div>

            <div className="flex flex-row gap-2 mt-3 overflow-hidden mx-7">
              <div className="rounded-xl bg-gray-100 w-2/3 mx-5 px-4 py-3">
                <div className="overflow-y-auto customized-scrollbar grid grid-cols-2 h-96 gap-3">
                  <div className="w-full h-44 rounded-lg bg-white">
                    <div className="flex flex-col pt-10 gap-2 overflow-hidden">
                      <div className="text-5xl font-mono w-full text-center">{speed}</div>
                      <div className="w-full text-center font-semibold">每秒输入数</div>
                    </div>
                  </div>
                  <div className="w-full h-44 rounded-lg bg-white">
                    <div className="flex flex-col pt-10 gap-2 overflow-hidden">
                      <div className="text-5xl font-mono w-full text-center">{timeString}</div>
                      <div className="w-full text-center font-semibold">章节耗时</div>
                    </div>
                  </div>
                  {wordCards}
                </div>
              </div>
              <div className="flex flex-col flex-auto font-sans gap-2 mt-5">
                <div className="text-xl w-full text-center">共有 {incorrectCount + multiIncorrectCount} 个单词出现错误</div>
                <div className="text-xl w-full text-center">其中 {multiIncorrectCount} 个单词多次出错</div>
                <button className="rounded-lg px-3 py-1.5 mt-3 mx-auto hover:bg-indigo-300 transition-colors duration-100 text-lg font-semibold  bg-indigo-200">
                  一键加入单词簿
                </button>
                <div className="text-xl mt-10 font-bold text-center">下一章节</div>
                <div className="text-3xl mt-5 font-bold text-center">{nextChapter}</div>
              </div>
            </div>

            <div className="w-full flex justify-end mt-2 gap-5 px-5 text-xl">
              <button
                className="rounded-large bg-gray-300 hover:bg-gray-400 px-6 py-2 font-semibold transition-colors duration-100"
                onClick={invisibleButtonHandler}
              >
                默写本章
              </button>
              <button
                className="rounded-large bg-gray-300 hover:bg-gray-400 px-6 py-2 font-semibold transition-colors duration-100"
                onClick={repeatButtonHandler}
              >
                重复本章
              </button>
              <button
                className={`rounded-large bg-green-400 hover:bg-green-500 px-6 py-2 font-semibold transition-colors duration-100 ${disabledClassName}`}
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
