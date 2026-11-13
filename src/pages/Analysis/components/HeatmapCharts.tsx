import { isOpenDarkModeAtom } from '@/store'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import type { Activity } from 'react-activity-calendar'
import { ActivityCalendar } from 'react-activity-calendar'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface HeatmapChartsProps {
  title: string
  data: Activity[]
}

const WEEKS_PER_YEAR = 53

const HeatmapCharts: FC<HeatmapChartsProps> = ({ data, title }) => {
  // react-activity-calendar v3 throws on empty data; fall back to a single empty day
  const safeData = data.length > 0 ? data : [{ date: dayjs().format('YYYY-MM-DD'), count: 0, level: 0 }]
  const [isOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [blockSize, setBlockSize] = useState(22)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const width = el.clientWidth
      // 160px horizontal padding + ~60px weekday/month labels
      setBlockSize(Math.max(6, Math.min(22, Math.floor((width - 220) / WEEKS_PER_YEAR))))
      setNarrow(width < 640)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center">
      <div className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</div>
      <ActivityCalendar
        fontSize={narrow ? 12 : 20}
        blockSize={blockSize}
        blockRadius={7}
        style={{
          padding: narrow ? '20px 10px 10px 10px' : '40px 60px 20px 100px',
          color: isOpenDarkMode ? '#fff' : '#000',
        }}
        colorScheme={isOpenDarkMode ? 'dark' : 'light'}
        data={safeData}
        theme={{
          light: ['#f0f0f0', '#6366f1'],
          dark: ['hsl(0, 0%, 22%)', '#818cf8'],
        }}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            'data-tooltip-id': 'react-tooltip',
            'data-tooltip-html': t('analysis.heatmapTooltip', { date: activity.date, count: activity.count }),
          } as React.SVGProps<SVGRectElement>)
        }
        showWeekdayLabels={true}
        labels={{
          months: t('analysis.months', { returnObjects: true }) as string[],
          weekdays: t('analysis.weekdays', { returnObjects: true }) as string[],
          totalCount: t('analysis.yearTotal', { count: 0 }),
          legend: {
            less: t('analysis.legendLess'),
            more: t('analysis.legendMore'),
          },
        }}
      />
      <ReactTooltip id="react-tooltip" />
    </div>
  )
}

export default HeatmapCharts
