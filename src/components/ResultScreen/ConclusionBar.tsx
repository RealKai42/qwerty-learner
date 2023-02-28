import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ICON_MAPPER = [
  {
    icon: ['fas', 'heart'],
    className: 'text-indigo-600',
    size: 'lg',
    text: (mistakeCount: number) => `表现不错！只错了 ${mistakeCount} 个单词`,
  },
  {
    icon: ['fas', 'thumbs-up'],
    className: 'text-indigo-600',
    size: 'lg',
    text: () => '有些小问题哦，下一次可以做得更好！',
  },
  {
    icon: ['fas', 'exclamation-triangle'],
    className: 'text-indigo-600',
    size: 'lg',
    text: () => '错误太多，再来一次如何？',
  },
]

const ConclusionBar = ({ mistakeLevel, mistakeCount }: ConclusionBarProps) => {
  const { icon, className, size, text } = ICON_MAPPER[mistakeLevel]

  return (
    <div className="flex h-10 flex-row items-center">
      <FontAwesomeIcon icon={icon as any} className={className} size={size as any} />
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
