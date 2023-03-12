import React from 'react'
import { range } from 'lodash'
import ChapterButton from './ChapterButton'
import { useAtom } from 'jotai'
import { currentChapterAtom } from '@/store'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ totalWords }) => {
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)

  const chapterCount = Math.ceil(totalWords / 20)
  return (
    <main className="mr-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {range(chapterCount).map((index) =>
        index + 1 === chapterCount ? (
          <ChapterButton
            wordCount={totalWords % 20 || 20}
            key={index}
            selected={currentChapter === index}
            index={index}
            onClick={() => setCurrentChapter(index)}
          />
        ) : (
          <ChapterButton
            wordCount={20}
            key={index}
            selected={currentChapter === index}
            index={index}
            onClick={() => setCurrentChapter(index)}
          />
        ),
      )}
    </main>
  )
}

export default ChapterGroup

export type ChapterGroupProps = {
  totalWords: number
}
