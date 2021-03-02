import { useState } from 'react'

const Tooltip: React.FC<
  React.PropsWithChildren<{
    /** 显示文本 */
    content: string
    /** 位置 */
    placement?: 'top' | 'bottom'
  }>
> = ({ children, content, placement = 'bottom' }) => {
  const [visible, setVisible] = useState(false)

  const placementClasses = {
    top: 'bottom-full pb-3',
    bottom: 'top-full pt-3',
  }[placement]

  return (
    <div className="group relative">
      <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
      </div>
      <div
        className={`${
          visible ? 'visible' : 'invisible'
        } ${placementClasses} absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center`}
      >
        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{content}</span>
      </div>
    </div>
  )
}

export default Tooltip
