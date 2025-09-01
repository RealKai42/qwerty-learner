import classNames from 'classnames'
import type { ElementType, SVGAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import IconExclamationTriangle from '~icons/heroicons/exclamation-triangle-solid'
import IconHandThumbUp from '~icons/heroicons/hand-thumb-up-solid'
import IconHeart from '~icons/heroicons/heart-solid'

type IconMapper = {
  icon: ElementType<SVGAttributes<SVGSVGElement>>
  className: string
  text: (mistakeCount: number) => string
}

const getIconMapper = (t: any): IconMapper[] => [
  {
    icon: IconHeart,
    className: 'text-indigo-600',
    text: (mistakeCount: number) =>
      mistakeCount > 0
        ? t('resultScreen.conclusion.excellent_with_errors', { count: mistakeCount })
        : t('resultScreen.conclusion.excellent_perfect'),
  },
  {
    icon: IconHandThumbUp,
    className: 'text-indigo-600',
    text: () => t('resultScreen.conclusion.good'),
  },
  {
    icon: IconExclamationTriangle,
    className: 'text-indigo-600',
    text: () => t('resultScreen.conclusion.poor'),
  },
]

const ConclusionBar = ({ mistakeLevel, mistakeCount }: ConclusionBarProps) => {
  const { t } = useTranslation()
  const iconMapper = getIconMapper(t)
  const { icon: Icon, className, text } = iconMapper[mistakeLevel]

  return (
    <div className="flex h-10 flex-row items-center">
      <Icon className={classNames(className, 'h-5 w-5')} />
      <span className="ml-2 inline-block align-middle text-sm font-medium leading-10 text-gray-700 sm:text-sm md:text-base">
        {text(mistakeCount)}
      </span>
    </div>
  )
}

export type ConclusionBarProps = {
  mistakeLevel: number
  mistakeCount: number
}

export default ConclusionBar
