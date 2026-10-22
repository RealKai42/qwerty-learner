import { toFixedNumber } from '@/utils'
import { db } from '@/utils/db'
import type { IChapterRecord } from '@/utils/db/record'
import { useEffect, useState } from 'react'

export function useChapterStats(chapter: number, dictID: string, isStartLoad: boolean, wordListRevision = 0) {
  const [chapterStats, setChapterStats] = useState<IChapterStats | null>(null)

  useEffect(() => {
    let cancelled = false
    setChapterStats(null)
    const fetchChapterStats = async () => {
      const stats = await getChapterStats(dictID, chapter, wordListRevision)
      if (!cancelled) setChapterStats(stats)
    }

    if (isStartLoad) {
      fetchChapterStats()
    }
    return () => {
      cancelled = true
    }
  }, [dictID, chapter, isStartLoad, wordListRevision])

  return chapterStats
}

interface IChapterStats {
  exerciseCount: number
  avgWrongWordCount: number
  avgWrongInputCount: number
}

async function getChapterStats(dict: string, chapter: number | null, wordListRevision: number): Promise<IChapterStats> {
  const records: IChapterRecord[] = await db.chapterRecords
    .where({ dict, chapter })
    .filter((record) => !wordListRevision || record.dictionaryRevision === wordListRevision)
    .toArray()

  const exerciseCount = records.length
  const totalWrongWordCount = records.reduce(
    (total, { wordNumber, correctWordIndexes }) => total + (wordNumber - correctWordIndexes.length),
    0,
  )
  const avgWrongWordCount = exerciseCount > 0 ? toFixedNumber(totalWrongWordCount / exerciseCount, 2) : 0

  const totalWrongInputCount = records.reduce((total, { wrongCount }) => total + (wrongCount ?? 0), 0)
  const avgWrongInputCount = exerciseCount > 0 ? toFixedNumber(totalWrongInputCount / exerciseCount, 2) : 0

  return { exerciseCount, avgWrongWordCount, avgWrongInputCount }
}
