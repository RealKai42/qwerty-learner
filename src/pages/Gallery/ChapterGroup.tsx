import React from 'react'
import { range } from 'lodash'
import { useSelectedChapter } from 'store/AppState'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ count }) => {
  const [selectedChapter, setSelectedChapter] = useSelectedChapter()
  return (
    <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-4">
      {range(count).map((index) => (
        <button
          className="relative p-4 w-36 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-10 border border-gray-300 dark:border-gray-500 shadow-lg rounded-md text-left overflow-hidden focus:outline-none"
          onClick={() => setSelectedChapter(index)}
          key={index}
        >
          {/* TODO: 部分字典的最后一个章节并非20词  */}
          <p className="text-lg text-gray-800 dark:text-white dark:text-opacity-80 w-full">Chapter {index + 1}</p>
          <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">20 词</p>
          {selectedChapter === index ? (
            <FontAwesomeIcon
              className="absolute -right-4 -bottom-4 text-6xl text-green-500 dark:text-green-300 opacity-60"
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
