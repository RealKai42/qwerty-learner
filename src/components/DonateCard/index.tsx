import type { AmountType } from '../DonatingCard'
import { DonatingCard } from '../DonatingCard'
import { StickerButton } from '../DonatingCard/components/StickerButton'
import { useChapterNumber, useDayFromFirstWordRecord, useSumWrongCount, useWordNumber } from './hooks/useWordStats'
import { DONATE_DATE } from '@/constants'
import { reportDonateCard } from '@/utils'
import noop from '@/utils/noop'
import { Dialog, Transition } from '@headlessui/react'
import dayjs from 'dayjs'
import type React from 'react'
import { Fragment, useLayoutEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import IconParty from '~icons/logos/partytown-icon'

export const DonateCard = () => {
  const [show, setShow] = useState(false)
  const [amount, setAmount] = useState<AmountType | undefined>(undefined)
  const { t } = useTranslation()

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
      amount: amount ?? 0,
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
      amount: amount ?? 0,
    })

    setShow(false)
  }

  const onAmountChange = (amount: AmountType) => {
    setAmount(amount)
  }

  useLayoutEffect(() => {
    if (chapterNumber && chapterNumber !== 0 && chapterNumber % 10 === 0) {
      const storedDate = window.localStorage.getItem(DONATE_DATE)
      const date = dayjs(storedDate)
      const now = dayjs()
      const diff = now.diff(date, 'day')
      if (!storedDate || diff > 60) {
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
              <Dialog.Panel className="relative my-8 w-[37rem] transform select-text overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
                <div className="flex w-full flex-col justify-center gap-4 bg-white px-2 pb-4 pt-5 dark:bg-gray-800 dark:text-gray-300">
                  <h1 className="gradient-text w-full pt-3 text-center text-[2.4rem] font-bold">
                    {t('donateCard.title', { chapterNumber })}
                  </h1>
                  <div className="flex w-full flex-col gap-4 px-4">
                    <p className="mx-auto px-4 indent-4">
                      <Trans
                        i18nKey="donateCard.achievement_text"
                        values={{ chapterNumber, dayFromFirstWord, wordNumber, sumWrongCount }}
                        components={{ 1: <HighlightedText>placeholder</HighlightedText> }}
                      />
                      <IconParty className="ml-2 inline-block" fontSize={16} />
                      <IconParty className="inline-block" fontSize={16} />
                      <IconParty className="inline-block" fontSize={16} />
                      <br />
                    </p>
                    <p className="mx-auto px-4 indent-4">
                      <Trans
                        i18nKey="donateCard.project_info"
                        values={{ dayFromQwerty }}
                        components={{ 1: <span className="font-medium" /> }}
                      />
                    </p>
                    <p className="mx-auto px-4 indent-4 ">
                      <Trans i18nKey="donateCard.sticker_info" components={{ 1: <span className="text-xs" /> }} />
                    </p>
                    <div className="flex items-center justify-center">
                      <StickerButton />
                    </div>
                  </div>

                  <DonatingCard className="mt-2" onAmountChange={onAmountChange} />
                  <div className="flex w-full justify-between  px-14 pb-3 pt-0">
                    <button
                      type="button"
                      className={`my-btn-primary ${!amount && 'invisible'} w-36 bg-amber-500 font-medium transition-all`}
                      onClick={onClickHasDonated}
                    >
                      {t('donateCard.donated_button')}
                    </button>
                    <button type="button" className="my-btn-primary w-36 font-medium" onClick={onClickRemindMeLater}>
                      {t('donateCard.remind_later_button')}
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
