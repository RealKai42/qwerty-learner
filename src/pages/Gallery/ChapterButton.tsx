import { useChapterStats } from './hooks/useChapterStats'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import type React from 'react'
import { useEffect, useRef } from 'react'
import IconCheckCircle from '~icons/heroicons/check-circle-solid'

export const ChapterButton: React.FC<ChapterButtonProps> = ({ index, selected, wordCount, onClick }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const entry = useIntersectionObserver(buttonRef, {})
  const isVisible = !!entry?.isIntersecting
  const chapterStatus = useChapterStats(index, isVisible)

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
      className="relative flex h-28 w-44 flex-col items-start justify-start overflow-hidden rounded-md border border-gray-300 bg-gray-50 p-4 text-left shadow-lg focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:bg-opacity-10"
      type="button"
      onClick={onClick}
      title="选择章节"
    >
      <p className="w-full pb-2 text-lg text-gray-800 dark:text-white dark:text-opacity-80">Chapter {index + 1}</p>
      <p className="text-xs font-medium text-gray-600 dark:text-white dark:text-opacity-60">单词数: {wordCount}</p>
      {chapterStatus !== null && (
        <>
          {chapterStatus.exerciseCount > 0 ? (
            <>
              <p className="text-xs font-medium text-gray-600 dark:text-white dark:text-opacity-60">
                练习次数: {chapterStatus.exerciseCount}
              </p>
              <p className="text-xs font-medium text-gray-600 dark:text-white dark:text-opacity-60">
                平均错误数: {chapterStatus.avgWrongCount}
              </p>
            </>
          ) : (
            <>
              <p className="pt-1 text-xs font-medium text-gray-600 dark:text-white dark:text-opacity-60">暂未练习</p>
            </>
          )}
        </>
      )}

      {selected ? (
        <IconCheckCircle className="absolute -bottom-4 -right-4 h-18 w-18 text-6xl text-green-500 opacity-60 dark:text-green-300" />
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
