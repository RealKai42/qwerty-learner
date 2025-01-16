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
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const Analysis = () => {
  const navigate = useNavigate()
  const [, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const changeDarkModeState = () => {
    setIsOpenDarkMode((old) => !old)
  }

  useHotkeys(
    'ctrl+d',
    () => {
      changeDarkModeState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  const { isEmpty, exerciseRecord, wordRecord, wpmRecord, accuracyRecord, wrongTimeRecord } = useWordStats(
    dayjs().subtract(1, 'year').unix(),
    dayjs().unix(),
  )

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto">
        <div className="fixed top-0 z-20 flex h-16 w-full items-center justify-between border border-b dark:border-gray-500">
          <div className="mx-10"></div>
          <span className="text-xl font-medium dark:text-white">数据统计</span>
          <IconX className="mx-4 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        </div>

        <ScrollArea.Root className="flex-1 overflow-y-auto px-4 pt-16 sm:px-16">
          <ScrollArea.Viewport className="h-full w-auto [&>div]:!block">
            {isEmpty ? (
              <div className="align-items-center m-4 grid h-80 w-auto place-content-center overflow-hidden rounded-lg shadow-lg dark:bg-gray-600">
                <div className="text-2xl text-gray-400">暂无练习数据</div>
              </div>
            ) : (
              <>
                <div className="mx-4 my-8 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <HeatmapCharts title="过去一年练习次数热力图" data={exerciseRecord} />
                </div>
                <div className="mx-4 my-8 h-auto w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <HeatmapCharts title="过去一年练习词数热力图" data={wordRecord} />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <LineCharts title="过去一年WPM趋势图" name="WPM" data={wpmRecord} />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <LineCharts title="过去一年正确率趋势图" name="正确率(%)" data={accuracyRecord} suffix="%" />
                </div>
                <div className="mx-4 my-8 h-80 w-auto overflow-hidden rounded-lg p-8 shadow-lg dark:bg-gray-700 dark:bg-opacity-50">
                  <KeyboardWithBarCharts title="按键错误次数排行" name="错误次数" data={wrongTimeRecord} />
                </div>
              </>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <div className="overflow-y-auto"></div>
      </div>
    </Layout>
  )
}

export default Analysis
