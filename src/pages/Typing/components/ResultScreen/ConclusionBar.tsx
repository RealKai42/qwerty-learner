import { cn } from '@/utils/ui'
import type { ElementType, SVGAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import IconExclamationTriangle from '~icons/heroicons/exclamation-triangle-solid'
import IconHandThumbUp from '~icons/heroicons/hand-thumb-up-solid'
import IconHeart from '~icons/heroicons/heart-solid'

type IconMapper = {
  icon: ElementType<SVGAttributes<SVGSVGElement>>
  className: string
  text: (mistakeCount: number, t: (key: string, options?: Record<string, unknown>) => string) => string
}

const ICON_MAPPER: IconMapper[] = [
  {
    icon: IconHeart,
    className: 'text-indigo-600',
    text: (mistakeCount: number, t) =>
      t('typing.result.conclusionGreat') +
      (mistakeCount > 0 ? t('typing.result.conclusionOnlyWrong', { count: mistakeCount }) : t('typing.result.conclusionPerfect')),
  },
  {
    icon: IconHandThumbUp,
    className: 'text-indigo-600',
    text: (_mistakeCount: number, t) => t('typing.result.conclusionMinor'),
  },
  {
    icon: IconExclamationTriangle,
    className: 'text-indigo-600',
    text: (_mistakeCount: number, t) => t('typing.result.conclusionTooMany'),
  },
]

const ConclusionBar = ({ mistakeLevel, mistakeCount }: ConclusionBarProps) => {
  const { t } = useTranslation()
  const { icon: Icon, className, text } = ICON_MAPPER[mistakeLevel]

  return (
    <div className="flex h-10 flex-row items-center">
      <Icon className={cn(className, 'h-5 w-5')} />
      <span className="ml-2 inline-block align-middle text-sm font-medium leading-10 text-gray-700 sm:text-sm md:text-base">
        {text(mistakeCount, t)}
      </span>
    </div>
  )
}

export type ConclusionBarProps = {
  mistakeLevel: number
  mistakeCount: number
}

export default ConclusionBar
