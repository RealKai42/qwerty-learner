import useWindowSize from '@/hooks/useWindowSize'
import * as echarts from 'echarts'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

interface LineChartProps {
  title: string
  data: [string, number][]
  name: string
  suffix?: string
}

const LineChart: FC<LineChartProps> = ({ data, title, suffix, name }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const chart = echarts.init(chartRef.current)
    const option = {
      tooltip: {
        trigger: 'axis',
        // formatter: function (p: [{ data: [string, number] }]) {
        //   return p[0].data[0] + ': ' + p[0].data[1]
        // },
      },
      title: {
        left: 'center',
        text: title,
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
        axisLabel: {
          formatter: (value: number) => value + (suffix || ''),
        },
      },
      series: [
        {
          name,
          type: 'line',
          smooth: true,
          data: data,
          emphasis: {
            focus: 'series',
          },
        },
      ],
    }

    chart.setOption(option)
  }, [data, title, suffix, name])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.getInstanceByDom(chartRef.current)
    chart?.resize()
  }, [width, height, chartRef])

  return <div style={{ width: '100%', height: '100%' }} ref={chartRef} className="line-chart"></div>
}

export default LineChart
