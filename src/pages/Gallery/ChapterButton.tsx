import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef } from 'react'

export const ChapterButton: React.FC<ChapterButtonProps> = ({ index, selected, onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (selected) {
      buttonRef.current?.scrollIntoView()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <button
      ref={buttonRef}
      className="relative p-4 w-36 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-10 border border-gray-300 dark:border-gray-500 shadow-lg rounded-md text-left overflow-hidden focus:outline-none"
      onClick={onClick}
    >
      {/* TODO: 部分字典的最后一个章节并非20词  */}
      <p className="text-lg text-gray-800 dark:text-white dark:text-opacity-80 w-full">Chapter {index + 1}</p>
      <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">20 词</p>
      {selected ? (
        <FontAwesomeIcon
          className="absolute -right-4 -bottom-4 text-6xl text-green-500 dark:text-green-300 opacity-60"
          icon={['fas', 'check-circle']}
          fixedWidth
        />
      ) : null}
    </button>
  )
}

export default ChapterButton

export type ChapterButtonProps = {
  index: number
  selected: boolean
  onClick: () => void
}
