import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import Tooltip from 'components/Tooltip'
import { useWordList } from 'pages/Typing/hooks/useWordList'
import { useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

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

export const ResultScreen: React.FC<ResultScreenProps> = ({
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

  const isDarkMode = useMemo(() => {
    return document.documentElement.classList.contains('dark')
  }, [])

  const correctRate = useMemo(() => {
    const chapterLength = wordList?.words.length || 0
    const correctCount = chapterLength - incorrectInfo.length
    return Math.floor((correctCount / chapterLength) * 100)
  }, [wordList, incorrectInfo])

  const rootFontSize = useMemo(() => {
    const root = document.documentElement
    return parseInt(window.getComputedStyle(root).getPropertyValue('font-size'))
  }, [])

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

  const conclusion = () => {
    let content
    switch (mistakeLevel) {
      case 0:
        content = (
          <>
            <FontAwesomeIcon icon={['fas', 'heart']} className="text-indigo-600 pt-2" size="lg" />
            <span className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">
              表现不错！只错了 {incorrectInfo.length} 个单词
            </span>
          </>
        )
        break
      case 1:
        content = (
          <div className="">
            <FontAwesomeIcon icon={['fas', 'thumbs-up']} className="text-indigo-600 leading-10 " size="lg" />
            <div className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">
              有些小问题哦，下一次可以做得更好！
            </div>
          </div>
        )
        break
      case 2:
        content = (
          <>
            <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-indigo-600 pt-2" size="lg" />
            <div className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">错误太多，再来一次如何？</div>
          </>
        )
        break
    }
    return <div className="h-10">{content}</div>
  }

  useHotkeys('enter', () => {
    //if last chapter, do nothing
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
            <div className="text-center mt-10 text-base font-sans font-normal text-gray-700 text-2xl dark:text-white">
              {wordList ? `${wordList.dictName}  第${wordList.chapter + 1}章` : ' '}
            </div>

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
                    <text x="3.5rem" y="3.2rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.6rem">
                      {correctRate}%
                    </text>
                    <text x="3.5rem" y="4.5rem" textAnchor="middle" dominantBaseline="middle" fontSize="0.95rem">
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
                    <text x="3.5rem" y="3.25rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.2rem">
                      {timeString}
                    </text>
                    <text x="3.5rem" y="4.75rem" textAnchor="middle" dominantBaseline="middle" fontSize="0.95rem">
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
                    <text x="3.5rem" y="3.25rem" textAnchor="middle" dominantBaseline="middle" fontSize="1.2rem">
                      {speedInfo.speed}个/s
                    </text>
                    <text x="3.5rem" y="4.75rem" textAnchor="middle" dominantBaseline="middle" fontSize="0.95rem">
                      输入字符
                    </text>
                  </svg>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-50 flex-grow mx-6 overflow-visible z-10">
                <div className="flex flex-row gap-4 flex-wrap overflow-y-auto overflow-x-hidden customized-scrollbar h-80 content-start ml-8 mr-1 pr-7 pt-9 z-20">
                  {incorrectInfo.map((info) => {
                    return (
                      <Tooltip content={`${info.translation}`}>
                        <div
                          className={`border-indigo-400 border-solid border-2 rounded-md bg-white hover:bg-indigo-100 w-auto h-12 px-5 py-1 flex flex-row gap-3 cursor-pointer transition-colors duration-100`}
                        >
                          <div className="font-mono font-light text-gray-600 text-3xl">{info.word}</div>
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
                <div className="bg-indigo-200 w-full rounded-b-lg flex flex-row justify-start align-center px-4">
                  <>{conclusion()}</>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-10 gap-5 px-5 text-xl">
              <Tooltip content="快捷键：shift + enter">
                <button
                  className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 h-12 text-base font-normal text-gray-700 transition-colors duration-100 border-solid border-2 border-gray-300"
                  onClick={invisibleButtonHandler}
                >
                  默写本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：space">
                <button
                  className="rounded-md bg-white hover:bg-indigo-200 px-6 py-2 h-12 text-base font-normal text-gray-700 transition-colors duration-100 border-solid border-2 border-gray-300 "
                  onClick={repeatButtonHandler}
                >
                  重复本章节
                </button>
              </Tooltip>
              <Tooltip content="快捷键：enter">
                <button
                  className={`rounded-md bg-indigo-400 hover:bg-indigo-600 px-6 py-2 h-12 text-base font-bold text-white transition-colors duration-100 ${
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
