import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import starBar from '@/assets/starBar.svg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { dismissStartCardDateAtom, isChapterEndAtom } from '@/store'
import { useAtom, useAtomValue } from 'jotai'

export default function StarCard() {
  const [countdown, setCountdown] = useState(3)
  const [isCounting, setIsCounting] = useState(false)
  const [dismissStartCardDate, setDismissStartCardDate] = useAtom(dismissStartCardDateAtom)
  const isChapterEnd = useAtomValue(isChapterEndAtom)
  const [isShow, setIsShow] = useState(false)

  useEffect(() => {
    if (isChapterEnd && dismissStartCardDate === null) {
      setIsShow(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChapterEnd])

  const onClickCloseStar = useCallback(() => {
    setIsShow(false)
    setDismissStartCardDate(new Date())
  }, [setIsShow, setDismissStartCardDate])

  const onClickWantStar = useCallback(() => {
    setIsCounting(true)
    setDismissStartCardDate(new Date())
  }, [setDismissStartCardDate])

  useEffect(() => {
    let countdownId: number
    if (isCounting && countdown > 0) {
      countdownId = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1)
      }, 1000)
    }
    if (countdown === 0) {
      setIsCounting(false)
      setIsShow(false)
    }

    return () => clearInterval(countdownId)
  }, [isCounting, countdown, setIsShow])

  const content = useMemo(() => {
    return (
      <>
        {isCounting ? (
          <div className="flex flex-col items-center gap-4 pt-6">
            <img src={starBar} className="svg-inline--fa fill-current text-4xl" alt="" />
            <span className="text-gray w-full text-center text-gray-400">
              收藏快捷键<span className="pl-2 text-indigo-600">cmd + d</span>
            </span>
          </div>
        ) : (
          <div className="flex pt-6 pb-0">
            <button
              onClick={onClickWantStar}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-lg text-white transition-colors duration-300 focus:outline-none"
            >
              我想收藏
            </button>
          </div>
        )}
      </>
    )
  }, [isCounting, onClickWantStar])

  return (
    <Transition
      appear={true}
      show={isShow}
      enter="transition ease-out duration-300 transform"
      enterFrom="translate-x-full -translate-y-full"
      enterTo="translate-x-0 translate-y-0"
      leave="transition ease-in duration-500 transform"
      leaveFrom="translate-x-0 translate-y-0"
      leaveTo="translate-x-full -translate-y-full"
      className="fixed  inset-0 z-20 flex h-0 justify-center"
    >
      <div className=" fixed top-4 right-1 flex w-150 flex-col items-center justify-evenly rounded-2xl bg-white p-12 shadow-2xl dark:bg-gray-800">
        <div className="absolute top-3 right-3">
          {isCounting && (
            <span className="m-1.5">
              <span className="text-indigo-600">{countdown}s</span>
              后自动关闭
            </span>
          )}
          <button onClick={onClickCloseStar}>
            <FontAwesomeIcon icon={['fas', 'times-circle']} className="text-indigo-400" size="lg" />
          </button>
        </div>
        <span className="pb-4 text-xl text-gray-600 dark:text-gray-50">
          坚持练习，提高语言能力。将 <span className="text-indigo-600">「Qwerty Learner」</span>保存到收藏夹，永不迷失！
        </span>
        {content}
      </div>
    </Transition>
  )
}
