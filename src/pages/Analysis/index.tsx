import { useWordStats } from './hooks/useWordStats'
import HeatmapChart from '@/components/Charts/HeatmapChart'
import LineChart from '@/components/Charts/LineChart'
import Layout from '@/components/Layout'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const Analysis = () => {
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  const { exerciseRecord, wordRecord, wpmRecord, accuracyRecord } = useWordStats(dayjs().subtract(1, 'year').unix(), dayjs().unix())

  return (
    <Layout>
      <div className="flex w-full flex-1 flex-col overflow-y-auto pl-20 pr-20 pt-20">
        <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        <ScrollArea.Root className="flex-1 overflow-y-auto">
          <ScrollArea.Viewport className="h-full w-full pb-[20rem]">
            <div className="m-4 h-80 w-auto rounded-lg shadow-lg">
              <HeatmapChart title="过去一年练习次数热力图" data={exerciseRecord} />
            </div>
            <div className="m-4 h-80 w-auto rounded-lg shadow-lg">
              <HeatmapChart title="过去一年练习词数热力图" data={wordRecord} />
            </div>
            <div className="m-4 h-80 w-auto rounded-lg shadow-lg">
              <LineChart title="过去一年WPM趋势图" name="WPM" data={wpmRecord} />
            </div>
            <div className="m-4 h-80 w-auto rounded-lg shadow-lg">
              <LineChart title="过去一年正确率趋势图" name="正确率(%)" data={accuracyRecord} suffix="%" />
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <div className="overflow-y-auto"></div>
      </div>
    </Layout>
  )
}

export default Analysis
