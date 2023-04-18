import { HeartIcon, HandThumbUpIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { ElementType, SVGAttributes } from 'react'

type IconMapper = {
  icon: ElementType<SVGAttributes<SVGSVGElement>>
  className: string
  text: (mistakeCount: number) => string
}

const ICON_MAPPER: IconMapper[] = [
  {
    icon: HeartIcon,
    className: 'text-indigo-600',
    text: (mistakeCount: number) => `表现不错！只错了 ${mistakeCount} 个单词`,
  },
  {
    icon: HandThumbUpIcon,
    className: 'text-indigo-600',
    text: () => '有些小问题哦，下一次可以做得更好！',
  },
  {
    icon: ExclamationTriangleIcon,
    className: 'text-indigo-600',
    text: () => '错误太多，再来一次如何？',
  },
]

const ConclusionBar = ({ mistakeLevel, mistakeCount }: ConclusionBarProps) => {
  const { icon: Icon, className, text } = ICON_MAPPER[mistakeLevel]

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
