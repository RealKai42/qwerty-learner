import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import Tooltip from 'components/Tooltip'
import { useWordList } from 'pages/Typing/hooks/useWordList'
import { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import ConclusionBar from './ConclusionBar'
import RemarkRing from './RemarkRing'
import WordChip from './WordChip'

export type IncorrectInfo = {
  word: string
  translation: string
}

export type ResultSpeedInfo = {
  speed: string
  minute: number
  second: number
}

type ResultScreenProps = {
  incorrectInfo: IncorrectInfo[]
  speedInfo: ResultSpeedInfo
  repeatButtonHandler: () => void
  invisibleButtonHandler: () => void
  nextButtonHandler: () => void
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  speedInfo,
  incorrectInfo,
  repeatButtonHandler,
  invisibleButtonHandler,
  nextButtonHandler,
}) => {
  const wordList = useWordList()

  const isLastChapter = useMemo(() => {
    if (wordList) {
      return wordList.chapter === wordList.chapterListLength - 1
    } else {
      return false
    }
  }, [wordList])

  const correctRate = useMemo(() => {
    const chapterLength = wordList?.words.length ?? 0
    const correctCount = chapterLength - incorrectInfo.length
    return Math.floor((correctCount / chapterLength) * 100)
  }, [wordList, incorrectInfo])

  const mistakeLevel = useMemo(() => {
    if (correctRate >= 85) {
      return 0
    } else if (correctRate >= 70) {
      return 1
    } else {
      return 2
    }
  }, [correctRate])

  const timeString = useMemo(() => {
    const { minute, second } = speedInfo
    const minuteString = minute < 10 ? '0' + minute : minute + ''
    const secondString = second < 10 ? '0' + second : second + ''
    return `${minuteString}:${secondString}`
  }, [speedInfo])

  useHotkeys('enter', () => {
    // If this is the last chapter, do nothing.
    if (isLastChapter) {
      return
    } else {
      nextButtonHandler()
    }
  })

  useHotkeys('space', () => {
    repeatButtonHandler()
  })

  useHotkeys('shift+enter', () => {
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
            <div className="text-center mt-10 font-sans font-normal text-gray-900 sm:text-xl md:text-2xl dark:text-white">
              {wordList ? `${wordList.dictName}  第${wordList.chapter + 1}章` : ' '}
            </div>

            <div className="flex flex-row gap-2 mt-10 overflow-hidden mx-10">
              <div className="flex flex-col gap-3 flex-grow-0 w-40 px-4 lg:px-4 md:px-2 sm:px-1">
                <RemarkRing remark={`${correctRate}%`} caption="正确率" percentage={correctRate} />
                <RemarkRing remark={timeString} caption="章节耗时" />
                <RemarkRing remark={`${speedInfo.speed}个/s`} caption="输入字符" />
              </div>
              <div className="rounded-xl bg-indigo-50 dark:bg-gray-700 flex-grow mx-6 overflow-visible z-10">
                <div className="flex flex-row gap-4 flex-wrap overflow-y-auto overflow-x-hidden customized-scrollbar h-80 content-start ml-8 mr-1 pr-7 pt-9 z-20">
                  {incorrectInfo.map((info) => (
                    <WordChip key={info.word} mistake={info} />
                  ))}
                </div>
                <div className="bg-indigo-200 dark:bg-indigo-400 w-full rounded-b-xl flex flex-row justify-start align-center px-4">
                  <ConclusionBar mistakeLevel={mistakeLevel} mistakeCount={incorrectInfo.length} />
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-10 gap-5 px-5 text-xl">
              <Tooltip content="快捷键：shift + enter">
                <button
                  className="rounded-md overflow-hidden bg-white dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 hover:bg-indigo-200 px-6 py-2 h-12 md:text-base sm:text-sm text-sm font-normal text-gray-700 transition-colors duration-100 border-solid border-2 border-gray-300"
                  onClick={invisibleButtonHandler}
                >
                  默写本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：space">
                <button
                  className="rounded-md overflow-hidden bg-white dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 hover:bg-indigo-200 px-6 py-2 h-12 md:text-base sm:text-sm text-sm font-normal text-gray-700 transition-colors duration-100 border-solid border-2 border-gray-300"
                  onClick={repeatButtonHandler}
                >
                  重复本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：enter">
                <button
                  className={`rounded-md overflow-hidden bg-indigo-400 hover:bg-indigo-600 px-6 py-2 h-12 md:text-base sm:text-sm text-sm font-bold text-white transition-colors duration-100 ${
                    isLastChapter ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  onClick={nextButtonHandler}
                  disabled={isLastChapter}
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
