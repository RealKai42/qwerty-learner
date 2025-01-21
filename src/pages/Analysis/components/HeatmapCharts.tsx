import './calendar-heatmap-styles.css'
import type { FC } from 'react'
import { useMemo } from 'react'
import React from 'react'
import type { TooltipDataAttrs } from 'react-calendar-heatmap'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Tooltip as ReactTooltip } from 'react-tooltip'

interface HeatmapChartsProps {
  title: string
  data: {
    date: Date
    count: number
  }[]
  startDate?: Date
  endDate?: Date
}
const HeatmapCharts: FC<HeatmapChartsProps> = (props) => {
  const { title, data, ...heatmapProps } = props

  const maxCount = useMemo(() => {
    return Math.max(...data.map((value) => value.count))
  }, [data])

  return (
    <div className="flex h-40 flex-col items-center  sm:h-64 sm:px-8 md:px-20 lg:px-32">
      <div className="sm:text-l pb-4 text-center text-base font-bold text-gray-600	dark:text-white">{title}</div>
      <div className="flex h-full w-full justify-center pr-4">
        {data.length && (
          <CalendarHeatmap
            values={data}
            classForValue={(value) => {
              if (!value) return 'color-empty'
              return `color-github-${((value.count * 4) / maxCount).toFixed()}`
            }}
            showWeekdayLabels={true}
            tooltipDataAttrs={(value) => {
              return {
                'data-tooltip-id': 'react-tooltip',
                'data-tooltip-html': `${value?.date.toString()} 练习数: ${value?.count}`,
              } as TooltipDataAttrs
            }}
            monthLabels={['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']}
            weekdayLabels={['周日', '周一', '周二', '周三', '周四', '周五', '周六']}
            {...heatmapProps}
          />
        )}
        <ReactTooltip id="react-tooltip" />
      </div>
    </div>
  )
}

export default HeatmapCharts
