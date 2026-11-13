import HeatmapCharts from './components/HeatmapCharts'
import KeyboardWithBarCharts from './components/KeyboardWithBarCharts'
import LineCharts from './components/LineCharts'
import { useWordStats } from './hooks/useWordStats'
import Layout from '@/components/Layout'
import { isOpenDarkModeAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const Analysis = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const changeDarkModeState = useCallback(() => {
    setIsOpenDarkMode((old) => !old)
  }, [setIsOpenDarkMode])

  useHotkeys(
    'ctrl+d',
    () => {
      changeDarkModeState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [changeDarkModeState],
  )

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  const { isEmpty, exerciseRecord, wordRecord, wpmRecord, accuracyRecord, wrongTimeRecord } = useWordStats(
    dayjs().subtract(1, 'year').unix(),
    dayjs().unix(),
  )

  return (
    <Layout>
      <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-4 md:pl-20">
        <IconX className="absolute right-4 top-4 md:right-20 md:top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
          <ScrollArea.Root className="flex-1 overflow-y-auto">
            <ScrollArea.Viewport className="h-full w-auto pb-[20rem] [&>div]:block!">
              {isEmpty ? (
                <div className="grid h-80 w-auto place-content-center overflow-hidden rounded-xl bg-white my-card dark:bg-gray-800">
                  <div className="text-2xl text-gray-400">{t('analysis.noPracticeData')}</div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 pr-4 md:pr-20">
                  <div className="h-auto w-auto overflow-hidden rounded-xl bg-white p-6 my-card transition-colors duration-300 dark:bg-gray-800">
                    <HeatmapCharts title={t('analysis.exerciseHeatmapTitle')} data={exerciseRecord} />
                  </div>
                  <div className="h-auto w-auto overflow-hidden rounded-xl bg-white p-6 my-card transition-colors duration-300 dark:bg-gray-800">
                    <HeatmapCharts title={t('analysis.wordHeatmapTitle')} data={wordRecord} />
                  </div>
                  <div className="h-80 w-auto overflow-hidden rounded-xl bg-white p-6 my-card transition-colors duration-300 dark:bg-gray-800">
                    <LineCharts title={t('analysis.wpmTrendTitle')} name="WPM" data={wpmRecord} yMin={0} />
                  </div>
                  <div className="h-80 w-auto overflow-hidden rounded-xl bg-white p-6 my-card transition-colors duration-300 dark:bg-gray-800">
                    <LineCharts
                      title={t('analysis.accuracyTrendTitle')}
                      name={t('analysis.accuracyName')}
                      data={accuracyRecord}
                      suffix="%"
                      yMin={0}
                      yMax={100}
                    />
                  </div>
                  <div className="h-80 w-auto overflow-hidden rounded-xl bg-white p-6 my-card transition-colors duration-300 dark:bg-gray-800">
                    <KeyboardWithBarCharts
                      title={t('analysis.keyErrorRankTitle')}
                      name={t('analysis.keyErrorName')}
                      data={wrongTimeRecord}
                    />
                  </div>
                </div>
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical"></ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </Layout>
  )
}

export default Analysis
