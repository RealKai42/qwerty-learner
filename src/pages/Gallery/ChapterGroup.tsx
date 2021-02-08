import React from 'react'
import { range } from 'lodash'
import { useSelectedChapter } from 'store/AppState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ count }) => {
  const [selectedChapter, setSelectedChapter] = useSelectedChapter()
  return (
    <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {range(count).map((index) => (
        <button
          className="relative p-4 w-36 bg-gray-50 border border-gray-300 shadow-lg rounded-md text-left overflow-hidden focus:outline-none"
          onClick={() => setSelectedChapter(index)}
        >
          <p className="text-xl text-gray-800">Chapter {index + 1}</p>
          <p className="text-sm font-bold text-gray-600">20 词</p>
          {selectedChapter === index ? (
            <FontAwesomeIcon
              className="absolute -right-4 -bottom-4 text-6xl text-green-500 opacity-60"
              icon={['fas', 'check-circle']}
              fixedWidth
            />
          ) : null}
        </button>
      ))}
    </main>
  )
}

export default ChapterGroup

export type ChapterGroupProps = { count: number }
