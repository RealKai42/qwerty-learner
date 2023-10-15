import { useChapterNumber, useDayFromFirstWordRecord, useSumWrongCount, useWordNumber } from './hooks/useWordStats'
import alipay from '@/assets/alipay.jpg'
import weChat from '@/assets/weChat.jpg'
import { DONATE_DATE } from '@/constants'
import { reportDonateCard } from '@/utils'
import noop from '@/utils/noop'
import { Dialog, Transition } from '@headlessui/react'
import dayjs from 'dayjs'
import type React from 'react'
import { Fragment, useLayoutEffect, useMemo, useState } from 'react'
import IconParty from '~icons/logos/partytown-icon'

export const DonateCard = () => {
  const [show, setShow] = useState(false)

  const chapterNumber = useChapterNumber()
  const wordNumber = useWordNumber()
  const sumWrongCount = useSumWrongCount()
  const dayFromFirstWord = useDayFromFirstWordRecord()
  const dayFromQwerty = useMemo(() => {
    const now = dayjs()
    const past = dayjs('2021-01-21')
    return now.diff(past, 'day')
  }, [])

  const HighlightedText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <span className={`font-bold  ${className ? className : 'text-indigo-500'}`}>{children}</span>
  }

  const onClickHasDonated = () => {
    reportDonateCard({
      type: 'donate',
      chapterNumber,
      wordNumber,
      sumWrongCount,
      dayFromFirstWord,
      dayFromQwerty,
    })

    setShow(false)
    const now = dayjs()
    window.localStorage.setItem(DONATE_DATE, now.format())
  }

  const onClickRemindMeLater = () => {
    reportDonateCard({
      type: 'dismiss',
      chapterNumber,
      wordNumber,
      sumWrongCount,
      dayFromFirstWord,
      dayFromQwerty,
    })

    setShow(false)
  }

  useLayoutEffect(() => {
    if (chapterNumber && chapterNumber !== 0 && chapterNumber % 10 === 0) {
      const storedDate = window.localStorage.getItem(DONATE_DATE)
      const date = dayjs(storedDate)
      const now = dayjs()
      const diff = now.diff(date, 'day')
      if (!storedDate || diff > 30) {
        setShow(true)
      }
    }
  }, [chapterNumber])

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          noop()
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative my-8 w-[35rem] transform select-text overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
                <div className="flex w-full flex-col justify-center gap-4  bg-white px-2 pb-4 pt-5 dark:bg-gray-800">
                  <h1 className="gradient-text w-full pb-2 pt-3 text-center text-[2.4rem] font-bold">{`${chapterNumber} Chapters Achievement !`}</h1>
                  <div className="flex w-full flex-col gap-4 px-4">
                    <p className="mx-auto px-4 indent-4">
                      您刚刚完成了<HighlightedText> {chapterNumber} </HighlightedText>章节的练习, Qwerty Learner 已经陪你走过
                      <HighlightedText> {dayFromFirstWord} </HighlightedText> 天，一起完成了
                      <HighlightedText> {wordNumber} </HighlightedText>
                      词的练习, 帮助您纠正了 <HighlightedText> {sumWrongCount} </HighlightedText>次错误输入，让我们一起为您的进步欢呼
                      <IconParty className="ml-2 inline-block" fontSize={16} />
                      <IconParty className="inline-block" fontSize={16} />
                      <IconParty className="inline-block" fontSize={16} />
                      <br />
                    </p>
                    <p className="mx-auto px-4 indent-4">
                      Qwerty Learner 已经坚持 <span className="font-medium ">开放源码、无广告、无商业化</span> 运营
                      <HighlightedText className="text-indigo-500"> {dayFromQwerty} </HighlightedText> 天,
                      我们的目标是为所有学习者提供一个高效、便捷、无干扰的学习环境。
                    </p>
                    <p className="mx-auto px-4 indent-4">
                      如果您喜欢 Qwerty, 那么我们诚挚地邀请您考虑进行捐赠，您的捐赠将直接用于维持 Qwerty 的日常运营以及未来的发展，让 Qwerty
                      与您一起成长。
                    </p>
                  </div>

                  <div className="flex w-full justify-center pt-6">
                    <img src={alipay} alt="alipay" className="mx-4 w-1/3" />
                    <img src={weChat} alt="weChat" className="mx-4 w-1/3" />
                  </div>
                  <div className="flex w-full justify-between  px-14 py-3  ">
                    <button type="button" className="my-btn-primary w-36 bg-amber-500 font-medium" onClick={onClickHasDonated}>
                      我已捐赠
                    </button>
                    <button type="button" className="my-btn-primary w-36 font-medium" onClick={onClickRemindMeLater}>
                      之后提醒我
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
