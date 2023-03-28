import { Transition } from '@headlessui/react'
import Tooltip from '@/components/Tooltip'
import { useWordList } from '@/pages/Typing/hooks/useWordList'
import { useCallback, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import ConclusionBar from './ConclusionBar'
import RemarkRing from './RemarkRing'
import WordChip from './WordChip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAtomValue, useSetAtom } from 'jotai'
import { currentChapterAtom, currentDictInfoAtom, infoPanelStateAtom } from '@/store'
import { recordOpenInfoPanelAction } from '@/utils'
import { InfoPanelType } from '@/typings'

export type IncorrectInfo = {
  word: string
  translation: string
}

export type ResultSpeedInfo = {
  speed: string
  minute: number
  second: number
}

interface ResultScreenProps {
  speedInfo: ResultSpeedInfo
  incorrectInfo: IncorrectInfo[]
  repeatButtonHandler: () => void
  invisibleButtonHandler: () => void
  nextButtonHandler: () => void
  exitButtonHandler: () => void
}

const ResultScreen = ({
  speedInfo,
  incorrectInfo,
  repeatButtonHandler,
  invisibleButtonHandler,
  nextButtonHandler,
  exitButtonHandler,
}: ResultScreenProps) => {
  const wordList = useWordList()
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const setInfoPanelState = useSetAtom(infoPanelStateAtom)

  const isLastChapter = useMemo(() => {
    return currentChapter >= currentDictInfo.length - 1
  }, [currentChapter, currentDictInfo])

  const correctRate = useMemo(() => {
    const chapterLength = wordList?.length ?? 0
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

  const handleOpenInfoPanel = useCallback(
    (modalType: InfoPanelType) => {
      recordOpenInfoPanelAction(modalType, 'resultScreen')
      setInfoPanelState((state) => {
        return {
          ...state,
          [modalType]: true,
        }
      })
    },
    [setInfoPanelState],
  )

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
              {wordList ? `${currentDictInfo.name}  第 ${currentChapter + 1} 章` : ' '}
            </div>
            <button className="absolute top-5 right-7" onClick={exitButtonHandler}>
              <FontAwesomeIcon icon={['fas', 'times']} className="text-gray-400" size="lg" />
            </button>
            <div className="mt-10 flex flex-row gap-2 overflow-hidden">
              <div className="flex flex-shrink-0 flex-grow-0 flex-col gap-3 px-4 sm:px-1 md:px-2 lg:px-4">
                <RemarkRing remark={`${correctRate}%`} caption="正确率" percentage={correctRate} />
                <RemarkRing remark={timeString} caption="章节耗时" />
                <RemarkRing remark={`${speedInfo.speed}个/s`} caption="输入字符" />
              </div>
              <div className="z-10 ml-6 flex-1 overflow-visible rounded-xl bg-indigo-50 dark:bg-gray-700">
                <div className="customized-scrollbar z-20 ml-8 mr-1 flex h-80 flex-row flex-wrap content-start gap-4 overflow-y-auto overflow-x-hidden pr-7 pt-9">
                  {incorrectInfo.map((info) => (
                    <WordChip key={info.word} mistake={info} />
                  ))}
                </div>
                <div className="align-center flex w-full flex-row justify-start rounded-b-xl bg-indigo-200 px-4 dark:bg-indigo-400">
                  <ConclusionBar mistakeLevel={mistakeLevel} mistakeCount={incorrectInfo.length} />
                </div>
              </div>
              <div className="ml-2 flex flex-col items-center justify-end text-xl">
                <span
                  className="cursor-pointer"
                  onClick={(e) => {
                    handleOpenInfoPanel('donate')
                    e.currentTarget.blur()
                  }}
                >
                  <FontAwesomeIcon icon={['fas', 'coffee']} className=" w-10 text-gray-500 dark:text-gray-400" />
                </span>
                <span
                  className="cursor-pointer"
                  onClick={(e) => {
                    handleOpenInfoPanel('community')
                    e.currentTarget.blur()
                  }}
                >
                  <FontAwesomeIcon icon={['fab', 'weixin']} className=" w-10 text-gray-500 dark:text-gray-400" />
                </span>
              </div>
            </div>
            <div className="mt-10 flex w-full justify-center gap-5 px-5 text-xl">
              <Tooltip content="快捷键：shift + enter">
                <button
                  className="btn-primary h-12 border-2 border-solid border-gray-300 bg-white text-base text-gray-700 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={invisibleButtonHandler}
                >
                  默写本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：space">
                <button
                  className="btn-primary h-12 border-2 border-solid border-gray-300 bg-white text-base text-gray-700 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={repeatButtonHandler}
                >
                  重复本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：enter">
                <button
                  className={`btn-primary { isLastChapter ? 'cursor-not-allowed opacity-50' : ''} h-12 text-base font-bold `}
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
