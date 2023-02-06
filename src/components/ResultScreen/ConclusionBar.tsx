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
    <div className="h-10 flex flex-row items-center">
      <FontAwesomeIcon icon={icon as any} className={className} size={size as any} />
      <span className="md:text-base sm:text-sm text-sm font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">
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
