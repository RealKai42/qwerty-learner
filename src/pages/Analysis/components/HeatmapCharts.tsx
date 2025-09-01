import { isOpenDarkModeAtom } from '@/store'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import React from 'react'
import type { Activity } from 'react-activity-calendar'
import ActivityCalendar from 'react-activity-calendar'
import { useTranslation } from 'react-i18next'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface HeatmapChartsProps {
  title: string
  data: Activity[]
}

const HeatmapCharts: FC<HeatmapChartsProps> = ({ data, title }) => {
  const [isOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center text-xl font-bold text-gray-600	dark:text-white">{title}</div>
      <ActivityCalendar
        fontSize={20}
        blockSize={22}
        blockRadius={7}
        style={{
          padding: '40px 60px 20px 100px',
          color: isOpenDarkMode ? '#fff' : '#000',
        }}
        colorScheme={isOpenDarkMode ? 'dark' : 'light'}
        data={data}
        theme={{
          light: ['#f0f0f0', '#6366f1'],
          dark: ['hsl(0, 0%, 22%)', '#818cf8'],
        }}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            'data-tooltip-id': 'react-tooltip',
            'data-tooltip-html': t('analysisCharts.tooltip', {
              date: activity.date,
              count: activity.count,
            }),
          })
        }
        showWeekdayLabels={true}
        labels={{
          months: [
            t('analysisCharts.months.january'),
            t('analysisCharts.months.february'),
            t('analysisCharts.months.march'),
            t('analysisCharts.months.april'),
            t('analysisCharts.months.may'),
            t('analysisCharts.months.june'),
            t('analysisCharts.months.july'),
            t('analysisCharts.months.august'),
            t('analysisCharts.months.september'),
            t('analysisCharts.months.october'),
            t('analysisCharts.months.november'),
            t('analysisCharts.months.december'),
          ],
          weekdays: [
            t('analysisCharts.weekdays.sunday'),
            t('analysisCharts.weekdays.monday'),
            t('analysisCharts.weekdays.tuesday'),
            t('analysisCharts.weekdays.wednesday'),
            t('analysisCharts.weekdays.thursday'),
            t('analysisCharts.weekdays.friday'),
            t('analysisCharts.weekdays.saturday'),
          ],
          totalCount: t('analysisCharts.total_count'),
          legend: {
            less: t('analysisCharts.legend.less'),
            more: t('analysisCharts.legend.more'),
          },
        }}
      />
      <ReactTooltip id="react-tooltip" />
    </div>
  )
}

export default HeatmapCharts
