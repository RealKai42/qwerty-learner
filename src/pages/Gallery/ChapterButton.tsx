import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef } from 'react'

export const ChapterButton: React.FC<ChapterButtonProps> = ({ index, selected, wordCount, onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (selected && buttonRef.current !== null) {
      const button = buttonRef.current
      const container = button.parentElement?.parentElement
      const halfHeight = button.getBoundingClientRect().height / 2
      container?.scrollTo({ top: Math.max(button.offsetTop - container.offsetTop - halfHeight, 0), behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])
  return (
    <button
      ref={buttonRef}
      className="relative p-4 w-36 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-10 border border-gray-300 dark:border-gray-500 shadow-lg rounded-md text-left overflow-hidden focus:outline-none"
      onClick={onClick}
    >
      <p className="text-lg text-gray-800 dark:text-white dark:text-opacity-80 w-full">Chapter {index + 1}</p>
      <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">{wordCount} 词</p>
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
  wordCount: number
  onClick: () => void
}
