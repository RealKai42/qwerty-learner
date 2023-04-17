import React, { useEffect, useRef } from 'react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

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
      className="relative w-36 overflow-hidden rounded-md border border-gray-300 bg-gray-50 p-4 text-left shadow-lg focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:bg-opacity-10"
      onClick={onClick}
    >
      <p className="w-full text-lg text-gray-800 dark:text-white dark:text-opacity-80">Chapter {index + 1}</p>
      <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">{wordCount} 词</p>
      {selected ? (
        <CheckCircleIcon className="absolute -bottom-4 -right-4 h-18 w-18 text-6xl text-green-500 opacity-60 dark:text-green-300" />
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
