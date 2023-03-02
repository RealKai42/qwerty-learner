import { Transition } from '@headlessui/react'
import Tooltip from '@/components/Tooltip'
import { useWordList } from '@/pages/Typing/hooks/useWordList'
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
  exitButtonHandler: () => void
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  speedInfo,
  incorrectInfo,
  repeatButtonHandler,
  invisibleButtonHandler,
  nextButtonHandler,
  exitButtonHandler,
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

  useHotkeys('esc', () => {
    exitButtonHandler()
  })

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="absolute inset-0 bg-gray-300 opacity-80 dark:bg-gray-600"></div>
      <Transition
        show={true}
        enter="ease-in duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-out duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex h-screen items-center justify-center">
          <div className="card fixed flex w-[90vw] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white px-10 pt-10 pb-14 shadow-lg dark:bg-gray-800 md:w-4/5 lg:w-3/5">
            <div className="text-center font-sans text-xl font-normal text-gray-900 dark:text-gray-400 md:text-2xl">
              {wordList ? `${wordList.dictName}  第 ${wordList.chapter + 1} 章` : ' '}
            </div>
            <div className="mt-10 flex flex-row gap-2 overflow-hidden">
              <div className="flex flex-shrink-0 flex-grow-0 flex-col gap-3 px-4 sm:px-1 md:px-2 lg:px-4">
                <RemarkRing remark={`${correctRate}%`} caption="正确率" percentage={correctRate} />
                <RemarkRing remark={timeString} caption="章节耗时" />
                <RemarkRing remark={`${speedInfo.speed}个/s`} caption="输入字符" />
              </div>
              <div className="z-10 mx-6 flex-1 overflow-visible rounded-xl bg-indigo-50 dark:bg-gray-700">
                <div className="customized-scrollbar z-20 ml-8 mr-1 flex h-80 flex-row flex-wrap content-start gap-4 overflow-y-auto overflow-x-hidden pr-7 pt-9">
                  {incorrectInfo.map((info) => (
                    <WordChip key={info.word} mistake={info} />
                  ))}
                </div>
                <div className="align-center flex w-full flex-row justify-start rounded-b-xl bg-indigo-200 px-4 dark:bg-indigo-400">
                  <ConclusionBar mistakeLevel={mistakeLevel} mistakeCount={incorrectInfo.length} />
                </div>
              </div>
            </div>
            <div className="mt-10 flex w-full justify-center gap-5 px-5 text-xl">
              <Tooltip content="快捷键：esc">
                <button
                  className="h-12 overflow-hidden rounded-md border-2 border-solid border-gray-300 bg-white px-6 py-2 text-sm font-normal text-gray-700 transition-colors duration-100 hover:bg-indigo-200 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 sm:text-sm md:text-base"
                  onClick={exitButtonHandler}
                >
                  返回
                </button>
              </Tooltip>
              <Tooltip content="快捷键：shift + enter">
                <button
                  className="h-12 overflow-hidden rounded-md border-2 border-solid border-gray-300 bg-white px-6 py-2 text-sm font-normal text-gray-700 transition-colors duration-100 hover:bg-indigo-200 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 sm:text-sm md:text-base"
                  onClick={invisibleButtonHandler}
                >
                  默写本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：space">
                <button
                  className="h-12 overflow-hidden rounded-md border-2 border-solid border-gray-300 bg-white px-6 py-2 text-sm font-normal text-gray-700 transition-colors duration-100 hover:bg-indigo-200 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 sm:text-sm md:text-base"
                  onClick={repeatButtonHandler}
                >
                  重复本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：enter">
                <button
                  className={`h-12 overflow-hidden rounded-md bg-indigo-400 px-6 py-2 text-sm font-bold text-white transition-colors duration-100 hover:bg-indigo-600 sm:text-sm md:text-base ${
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
