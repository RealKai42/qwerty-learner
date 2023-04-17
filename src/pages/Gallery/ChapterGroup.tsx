import React from 'react'
import range from '@/utils/range'
import ChapterButton from './ChapterButton'
import { useAtom, useAtomValue } from 'jotai'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import { CHAPTER_LENGTH } from '@/constants'
import { useUpdateEffect } from 'react-use'

const ChapterGroup: React.FC<ChapterGroupProps> = ({ totalWords }) => {
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  useUpdateEffect(() => {
    setCurrentChapter(0)
  }, [currentDictInfo, setCurrentChapter])

  return (
    <main className="mr-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {range(0, currentDictInfo.chapterCount, 1).map((index) =>
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
