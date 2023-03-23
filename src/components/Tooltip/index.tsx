import { ReactNode, useState } from 'react'
import { classNames } from '@/utils'

const Tooltip = ({ children, content, className, placement = 'top' }: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  const placementClasses = {
    top: 'bottom-full pb-2',
    bottom: 'top-full pt-2',
  }[placement]

  return (
    <div className={classNames('relative', className)}>
      <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
      </div>
      <div
        className={`${
          visible ? 'opacity-100' : 'opacity-0'
        } ${placementClasses} pointer-events-none absolute left-1/2 flex -translate-x-1/2 transform items-center justify-center transition-opacity`}
      >
        <span className="whitespace-nowrap rounded-lg bg-white py-1 px-2 text-xs text-gray-500 shadow-md dark:bg-gray-700 dark:text-gray-300">
          {content}
        </span>
      </div>
    </div>
  )
}

export type TooltipProps = {
  children: ReactNode
  /** 显示文本 */
  content: string
  /** 位置 */
  placement?: 'top' | 'bottom'
  className?: string
}

export default Tooltip
