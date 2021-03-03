import { useState } from 'react'

const Tooltip: React.FC<
  React.PropsWithChildren<{
    /** 显示文本 */
    content: string
    /** 位置 */
    placement?: 'top' | 'bottom'
  }>
> = ({ children, content, placement = 'top' }) => {
  const [visible, setVisible] = useState(false)

  const placementClasses = {
    top: 'bottom-full pb-2',
    bottom: 'top-full pt-2',
  }[placement]

  return (
    <div className="relative">
      <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
      </div>
      <div
        className={`${
          visible ? 'opacity-100' : 'opacity-0'
        } ${placementClasses} absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none transition-opacity`}
      >
        <span className="py-1 px-2 bg-white dark:bg-gray-700 rounded-lg shadow-md text-gray-500 dark:text-gray-300 text-xs whitespace-nowrap">
          {content}
        </span>
      </div>
    </div>
  )
}

export default Tooltip
