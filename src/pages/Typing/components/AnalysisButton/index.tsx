import { TypingStateActionType, useTypingContext } from '../../store'
import HeatmapCharts from '@/pages/Analysis/components/HeatmapCharts'
import KeyboardWithBarCharts from '@/pages/Analysis/components/KeyboardWithBarCharts'
import LineCharts from '@/pages/Analysis/components/LineCharts'
import { useWordStats } from '@/pages/Analysis/hooks/useWordStats'
import { Dialog, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import dayjs from 'dayjs'
import { Fragment, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconChartPie from '~icons/heroicons/chart-pie-solid'
import IconX from '~icons/tabler/x'

export default function AnalysisButton() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { dispatch } = useTypingContext()

  const openModal = useCallback(() => {
    setIsOpen(true)
    dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
  }, [dispatch])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const { isEmpty, exerciseRecord, wordRecord, wpmRecord, accuracyRecord, wrongTimeRecord } = useWordStats(
    dayjs().subtract(1, 'year').unix(),
    dayjs().unix(),
  )

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white ${
          isOpen && 'bg-indigo-500 text-white'
        }`}
        title={t('typing.switcher.viewStats')}
      >
        <IconChartPie className="icon" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="flex h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-full w-full flex-col overflow-hidden bg-white p-0 dark:bg-gray-800">
                  <div className="relative flex h-16 items-center justify-between border-b border-neutral-100 bg-stone-50 px-6 py-3 dark:border-neutral-700 dark:bg-gray-900">
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{t('analysis.statsTitle')}</span>
                    <button type="button" onClick={closeModal} title={t('settings.closeDialog')}>
                      <IconX className="cursor-pointer text-gray-400" />
                    </button>
                  </div>

                  <ScrollArea.Root className="flex-1 select-none overflow-y-auto">
                    <ScrollArea.Viewport className="h-full w-full px-3">
                      {isEmpty ? (
                        <div className="grid h-60 w-auto place-content-center rounded-lg shadow-lg dark:bg-gray-600">
                          <div className="text-2xl text-gray-400">{t('analysis.noPracticeData')}</div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="my-4 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700/50">
                            <HeatmapCharts title={t('analysis.exerciseHeatmapTitle')} data={exerciseRecord} />
                          </div>
                          <div className="my-4 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700/50">
                            <HeatmapCharts title={t('analysis.wordHeatmapTitle')} data={wordRecord} />
                          </div>
                          <div className="my-4 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700/50">
                            <LineCharts title={t('analysis.wpmTrendTitle')} name="WPM" data={wpmRecord} yMin={0} />
                          </div>
                          <div className="my-4 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700/50">
                            <LineCharts
                              title={t('analysis.accuracyTrendTitle')}
                              name={t('analysis.accuracyName')}
                              data={accuracyRecord}
                              suffix="%"
                              yMin={0}
                              yMax={100}
                            />
                          </div>
                          <div className="my-4 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700/50">
                            <KeyboardWithBarCharts
                              title={t('analysis.keyErrorRankTitle')}
                              name={t('analysis.keyErrorName')}
                              data={wrongTimeRecord}
                            />
                          </div>
                        </div>
                      )}
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical" />
                  </ScrollArea.Root>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
