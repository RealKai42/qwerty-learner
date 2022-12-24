import { Transition } from '@headlessui/react'
import SpeedVariant from 'components/SpeedVariant'

type ResultScreenProps = {
  show: boolean
  correctCount: number
  inputCount: number
  setOrder: React.Dispatch<React.SetStateAction<number>>
  setIsStart: React.Dispatch<React.SetStateAction<boolean>>
  setResultscreenState: React.Dispatch<React.SetStateAction<boolean>>
  AddChapter: React.Dispatch<React.SetStateAction<boolean>>
  ResetChapter: React.Dispatch<React.SetStateAction<boolean>>
  setInvisible: React.Dispatch<React.SetStateAction<boolean>>
  resetChapterFlag: boolean
  setResetChapterFlag: React.Dispatch<React.SetStateAction<boolean>>
  dictName: string | undefined
  chapter: number | undefined
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  show,
  correctCount,
  inputCount,
  AddChapter,
  ResetChapter,
  setIsStart,
  setOrder,
  setResultscreenState,
  setInvisible,
  resetChapterFlag,
  setResetChapterFlag,
  dictName,
  chapter,
}) => {
  const buttonHandler1 = () => {
    setOrder(0)
    setIsStart(false)
    setResultscreenState(false)
    setInvisible(false)
  }

  const buttonHandler2 = () => {
    setOrder(0)
    setIsStart(false)
    setResultscreenState(false)
  }

  const buttonHandler3 = () => {
    setOrder(0)
    setIsStart(true)
    setResultscreenState(false)

    if (resetChapterFlag) {
      ResetChapter(true)
      setResetChapterFlag(false)
    } else {
      AddChapter(true)
    }
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <Transition
        appear={true}
        show={show}
        enter="ease-in duration-100"
        enterFrom="opacity-0 "
        enterTo="opacity-100 "
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0" aria-hidden="true">
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-b
          from-black
          via-gray-800
          to-gray-600
          opacity-90"
          >
            <div className="flex-col items-center justify-center w-full h-full">
              <Transition
                appear={true}
                show={show}
                enter="ease-in duration-300"
                enterFrom="opacity-0 "
                enterTo="opacity-100 "
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex-col text-white mt-28">
                  <div className="flex justify-center text-3xl gap-10">
                    <span>{dictName}</span>
                    <span>第{(chapter as number) + 1}章</span>
                  </div>
                  <div className="flex justify-center font-mono text-9xl mt-5 font-bold">Chapter cleared</div>
                  <div className="flex justify-center text-2xl mt-5">已完成本章节</div>
                </div>
              </Transition>
              <Transition
                appear={true}
                show={show}
                enter="ease-in duration-500"
                enterFrom="opacity-0 "
                enterTo="opacity-100 "
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex gap-6 items-center justify-center text-2xl mt-20">
                  <button
                    className=" bg-gray-100 px-6 py-2.5 hover:bg-gray-400 transition-all duration-200 rounded-full focus:outline-none font-semibold"
                    onClick={() => buttonHandler1()}
                  >
                    默写本章
                  </button>
                  <button
                    className="bg-gray-100 px-6 py-2.5 hover:bg-gray-400 transition-all duration-200 rounded-full focus:outline-none font-semibold"
                    onClick={() => buttonHandler2()}
                  >
                    重复本章
                  </button>
                  <button
                    className=" bg-green-400 px-6 py-2.5 inline-flex animate-longpulse transition-all duration-200 hover:bg-green-600 rounded-full focus:outline-none font-semibold"
                    onClick={() => buttonHandler3()}
                  >
                    {resetChapterFlag ? '回到首章' : '下一章节'}
                    <svg
                      aria-hidden="true"
                      className="ml-2 -mr-1 w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
              </Transition>

              <Transition
                appear={true}
                show={show}
                enter="ease-in duration-700"
                enterFrom="opacity-0 "
                enterTo="opacity-100 "
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex justify-center mt-20">
                  <SpeedVariant correctCount={correctCount} inputCount={inputCount} />
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default ResultScreen
