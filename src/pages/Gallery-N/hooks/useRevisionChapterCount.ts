import { calcChapterCount } from '@/utils'
import { db } from '@/utils/db'
import { useEffect, useState } from 'react'

export function useRevisionChapterCount(dictID: string, isRevisionMode: boolean) {
  const [chapterCount, setChapterCount] = useState<number>(0)

  useEffect(() => {
    const fetchChapterCount = async () => {
      const count = await getRevisionChapterCount(dictID)
      setChapterCount(count)
    }

    if (isRevisionMode && dictID) {
      fetchChapterCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictID, isRevisionMode])

  return chapterCount
}

async function getRevisionChapterCount(dict: string): Promise<number> {
  const wordCount = await db.wordRecords
    .where('dict')
    .equals(dict)
    .and((wordRecord) => wordRecord.wrongCount > 0)
    .toArray()
    .then((wordRecords) => {
      const res = new Map()
      const reducedRecords = wordRecords.filter((item) => !res.has(item['word'] + item['dict']) && res.set(item['word'] + item['dict'], 1))
      return reducedRecords.length
    })
  return calcChapterCount(wordCount ?? 0)
  return 0
}
