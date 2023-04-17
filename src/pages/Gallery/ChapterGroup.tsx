import { CHAPTER_LENGTH } from '@/constants'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import { useAtom, useAtomValue } from 'jotai'
import { range } from 'lodash'
import React from 'react'
import { useUpdateEffect } from 'react-use'
import ChapterButton from './ChapterButton'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ totalWords }) => {
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  useUpdateEffect(() => {
    setCurrentChapter(0)
  }, [currentDictInfo, setCurrentChapter])

  return (
    <main className="mr-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {range(currentDictInfo.chapterCount).map((index) =>
        index + 1 === currentDictInfo.chapterCount ? (
          <ChapterButton
            wordCount={totalWords % CHAPTER_LENGTH || CHAPTER_LENGTH}
            key={index}
            selected={currentChapter === index}
            index={index}
            onClick={() => setCurrentChapter(index)}
          />
        ) : (
          <ChapterButton
            wordCount={CHAPTER_LENGTH}
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
