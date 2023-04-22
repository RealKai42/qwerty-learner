import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import { useChapterStats } from '@/pages/Gallery-N/hooks/useChapterStats'
import { useRef } from 'react'

export default function ChapterRow({
  index,
  dictID,
  checked,
  onChange,
}: {
  index: number
  checked: boolean
  dictID: string
  onChange: (index: number) => void
}) {
  const rowRef = useRef<HTMLTableRowElement>(null)

  const entry = useIntersectionObserver(rowRef, {})
  const isVisible = !!entry?.isIntersecting
  const chapterStatus = useChapterStats(index, dictID, isVisible)

  return (
    <tr className="flex" ref={rowRef}>
      <td className="flex w-15  items-center justify-center px-6 py-4">
        <input
          type="radio"
          name="selectedChapter"
          checked={checked}
          onChange={() => {
            onChange(index)
          }}
          className="mt-0.5 rounded-full border-gray-300 text-indigo-600 outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 "
        />
      </td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700">{index + 1}</td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700">{chapterStatus ? chapterStatus.exerciseCount : 0}</td>
      <td className="flex-1 px-6 py-4 text-center text-sm text-gray-700">{chapterStatus ? chapterStatus.avgWrongCount : 0}</td>
    </tr>
  )
}
