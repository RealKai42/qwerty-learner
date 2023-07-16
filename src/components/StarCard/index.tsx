import starBar from '@/assets/starBar.svg'
import { DISMISS_START_CARD_DATE_KEY } from '@/constants'
import { dismissStartCardDateAtom } from '@/store'
import { recordStarAction } from '@/utils'
import { Transition } from '@headlessui/react'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import IconCircleX from '~icons/tabler/circle-x'

export default function StarCard() {
  const [countdown, setCountdown] = useState(5)
  const [isCounting, setIsCounting] = useState(false)
  const setDismissStartCardDate = useSetAtom(dismissStartCardDateAtom)
  const [isShow, setIsShow] = useState(false)

  useLayoutEffect(() => {
    // 直接使用 jotai 的 dismissStartCardDate 其值先是默认值，然后才是 localStorage 中的值
    const value = window.localStorage.getItem(DISMISS_START_CARD_DATE_KEY) as Date | null
    if (value === null) {
      setIsShow(true)
    }
  }, [])

  const onClickCloseStar = useCallback(() => {
    setIsShow(false)
    setDismissStartCardDate(new Date())
    if (!isCounting) {
      recordStarAction('dismiss')
    }
  }, [setIsShow, setDismissStartCardDate, isCounting])

  const onClickWantStar = useCallback(() => {
    setIsCounting(true)
    setDismissStartCardDate(new Date())
    recordStarAction('star')
  }, [setDismissStartCardDate])

  useEffect(() => {
    let countdownId: number
    if (isCounting && countdown > 0) {
      countdownId = window.setInterval(() => {
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
            <img src={starBar} className="fill-current text-4xl" alt="star project" />
            <span className="text-gray w-full text-center text-gray-400">
              收藏快捷键<span className="pl-2 text-indigo-600">cmd + d</span>
            </span>
          </div>
        ) : (
          <div className="flex pb-0 pt-6">
            <button
              className="rounded-lg bg-indigo-600 px-6 py-2 text-lg text-white transition-colors duration-300 focus:outline-none"
              type="button"
              onClick={onClickWantStar}
              title="我想收藏"
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
      appear
      show={isShow}
      enter="transition ease-out duration-300 transform"
      enterFrom="translate-x-full -translate-y-full"
      enterTo="translate-x-0 translate-y-0"
      leave="transition ease-in duration-500 transform"
      leaveFrom="translate-x-0 translate-y-0"
      leaveTo="translate-x-full -translate-y-full"
      className="fixed inset-0 z-30 hidden h-0 justify-center md:flex"
    >
      <div className="fixed right-1 top-4 flex w-150 flex-col items-center justify-evenly rounded-2xl bg-white p-12 shadow-2xl dark:bg-gray-800">
        <div className="absolute right-3 top-3">
          {isCounting && (
            <span className="m-1.5 dark:text-gray-100">
              <span className="text-indigo-600">{countdown}s</span>
              后自动关闭
            </span>
          )}
          <button type="button" onClick={onClickCloseStar} title="关闭提示" aria-label="关闭提示">
            <IconCircleX className="text-indigo-400" />
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
