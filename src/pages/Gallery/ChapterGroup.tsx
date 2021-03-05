import React from 'react'
import { range } from 'lodash'
import { useSelectedChapter } from 'store/AppState'
import ChapterButton from './ChapterButton'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ count }) => {
  const [selectedChapter, setSelectedChapter] = useSelectedChapter()
  return (
    <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mr-4">
      {range(count).map((index) => (
        <ChapterButton key={index} selected={selectedChapter === index} index={index} onClick={() => setSelectedChapter(index)} />
      ))}
    </main>
  )
}

export default ChapterGroup

export type ChapterGroupProps = { count: number }
