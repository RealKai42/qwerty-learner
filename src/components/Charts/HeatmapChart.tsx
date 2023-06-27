import useWindowSize from '@/hooks/useWindowSize'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

interface HeatmapChartProps {
  title: string
  data: [string, number][]
}

const HeatmapChart: FC<HeatmapChartProps> = ({ data, title }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const start = dayjs().subtract(1, 'year').valueOf()
    const end = dayjs().valueOf()

    const chart = echarts.init(chartRef.current)
    const option = {
      title: {
        top: 30,
        left: 'center',
        text: title,
      },
      tooltip: {
        formatter: function (p: { data: [string, number] }) {
          return p.data[0] + ': ' + p.data[1]
        },
      },
      visualMap: {
        min: 0,
        max: Math.max.apply(
          null,
          data.map((d) => d[1]),
        ),
        calculable: true,
        orient: 'horizontal',
        top: 50,
        right: 30,
        inRange: {
          color: ['#4f46e533', '#4f46e566', '#4f46e599', '#4f46e5CC', '#4f46e5FF'],
        },
      },
      calendar: {
        top: 120,
        left: 30,
        right: 30,
        cellSize: 20,
        range: [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')],
        itemStyle: {
          borderWidth: 0.5,
        },
        yearLabel: { show: false },
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    }

    chart.setOption(option)
  }, [data, title])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.getInstanceByDom(chartRef.current)
    console.log(width, height, chart)
    chart?.resize({ width: width - 192, height: 320 })
  }, [width, height, chartRef])

  return <div style={{ width: '100%', height: '100%' }} ref={chartRef} className="heatmap-chart"></div>
}

export default HeatmapChart
