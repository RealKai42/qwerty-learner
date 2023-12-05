import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import { useChapterStats } from '@/pages/Gallery-N/hooks/useChapterStats'
import noop from '@/utils/noop'
import { useEffect, useRef } from 'react'

type ChapterRowProps = {
  index: number
  checked: boolean
  dictID: string
  onChange: (index: number) => void
}
export default function ChapterRow({ index, dictID, checked, onChange }: ChapterRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)

  const entry = useIntersectionObserver(rowRef, {})
  const isVisible = !!entry?.isIntersecting
  const chapterStatus = useChapterStats(index, dictID, isVisible)

  useEffect(() => {
    if (checked && rowRef.current !== null) {
      const button = rowRef.current
      const container = button.parentElement?.parentElement?.parentElement
      container?.scroll({
        top: button.offsetTop - container.offsetTop - 300,
        behavior: 'smooth',
      })
    }
  }, [checked])

  return (
    <tr
      className="flex cursor-pointer even:bg-gray-50 hover:bg-indigo-100 dark:bg-gray-800 dark:even:bg-gray-700 dark:hover:bg-gray-600"
      ref={rowRef}
      onClick={() => onChange(index)}
    >
      <td className="flex w-15  items-center justify-center px-6 py-4">
        <input
          type="radio"
          name="selectedChapter"
          checked={checked}
          onChange={noop}
          className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded-full border-gray-300  text-indigo-600 outline-none  focus:outline-none focus:ring-0 focus:ring-offset-0 "
        />
      </td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-200">{index + 1}</td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-200">
        {chapterStatus ? chapterStatus.exerciseCount : 0}
      </td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-200">
        {chapterStatus ? chapterStatus.avgWrongWordCount : 0}
      </td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-200">
        {chapterStatus ? chapterStatus.avgWrongInputCount : 0}
      </td>
    </tr>
  )
}
