import { db } from '@/utils/db'
import type { IChapterRecord } from '@/utils/db/record'
import { useEffect, useState } from 'react'

export function useDictStats(dictID: string, isStartLoad: boolean, wordListRevision = 0) {
  const [dictStats, setDictStats] = useState<IDictStats | null>(null)

  useEffect(() => {
    let cancelled = false
    setDictStats(null)
    const fetchDictStats = async () => {
      const stats = await getDictStats(dictID, wordListRevision)
      if (!cancelled) setDictStats(stats)
    }

    if (isStartLoad) {
      fetchDictStats()
    }
    return () => {
      cancelled = true
    }
  }, [dictID, isStartLoad, wordListRevision])

  return dictStats
}

interface IDictStats {
  exercisedChapterCount: number
}

async function getDictStats(dict: string, wordListRevision: number): Promise<IDictStats> {
  const records: IChapterRecord[] = await db.chapterRecords
    .where({ dict })
    .filter((record) => !wordListRevision || record.dictionaryRevision === wordListRevision)
    .toArray()
  const allChapter = records.map(({ chapter }) => chapter).filter((item) => item !== null) as number[]
  const uniqueChapter = allChapter.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
  const exercisedChapterCount = uniqueChapter.length

  return { exercisedChapterCount }
}
