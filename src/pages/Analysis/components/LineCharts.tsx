import purple from './purple.json'
import useWindowSize from '@/hooks/useWindowSize'
import { isOpenDarkModeAtom } from '@/store'
import { LineChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

echarts.registerTheme('purple', purple)
echarts.use([GridComponent, TitleComponent, TooltipComponent, LineChart, CanvasRenderer])

interface LineChartsProps {
  title: string
  data: [string, number][]
  name: string
  suffix?: string
  yMin?: number
  yMax?: number
}

const LineCharts: FC<LineChartsProps> = ({ data, title, suffix, name, yMin, yMax }) => {
  const [isOpenDarkMode] = useAtom(isOpenDarkModeAtom)

  const chartRef = useRef<HTMLDivElement>(null)

  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    let chart = echarts.getInstanceByDom(chartRef.current)
    chart?.dispose()

    chart = echarts.init(chartRef.current, isOpenDarkMode ? 'purple' : 'light')

    const option = {
      tooltip: { trigger: 'axis' },
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '10%',
      },
      xAxis: {
        type: 'time',
        axisPointer: {
          label: {
            formatter: function (params: { seriesData: [{ data: [string, number] }] }) {
              return params.seriesData[0].data[0]
            },
          },
        },
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        axisLabel: { formatter: (value: number) => value + (suffix || '') },
      },
      series: [
        {
          name,
          type: 'line',
          smooth: true,
          data: data,
          emphasis: { focus: 'series' },
        },
      ],
    }

    chart.setOption(option)
    return () => {
      chart.dispose()
    }
  }, [data, title, suffix, name, isOpenDarkMode, yMin, yMax])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.getInstanceByDom(chartRef.current)
    chart?.resize()
  }, [width, height, chartRef])

  return (
    <div className="flex h-full flex-col">
      <div className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</div>
      <div style={{ width: '100%', height: '100%' }} ref={chartRef} className="line-chart flex-grow"></div>
    </div>
  )
}

export default LineCharts
