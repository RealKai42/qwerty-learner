import { db } from '.'
import { ReviewRecord } from './record'
import type { TErrorWordData } from '@/pages/Gallery-N/hooks/useErrorWords'
import type { Word } from '@/typings'
import { useEffect, useState } from 'react'

export function useGetLatestReviewRecord(dictID: string) {
  const [wordReviewRecord, setWordReviewRecord] = useState<ReviewRecord | undefined>(undefined)
  useEffect(() => {
    const fetchWordReviewRecords = async () => {
      const record = await getReviewRecords(dictID)
      setWordReviewRecord(record)
    }
    if (dictID) {
      fetchWordReviewRecords()
    }
  }, [dictID])
  return wordReviewRecord
}

async function getReviewRecords(dictID: string): Promise<ReviewRecord | undefined> {
  const records = await db.reviewRecords.where('dict').equals(dictID).toArray()

  const latestRecord = records.sort((a, b) => a.createTime - b.createTime).pop()

  return latestRecord && (latestRecord.isFinished ? undefined : latestRecord)
}

type TRankedErrorWordData = TErrorWordData & {
  errorCountScore: number
  latestErrorTimeScore: number
}

export async function generateNewWordReviewRecord(dictID: string, errorData: TErrorWordData[]) {
  const errorCountRankings = [...errorData].sort((a, b) => a.errorCount - b.errorCount)
  const latestErrorTimeRankings = [...errorData].sort((a, b) => a.latestErrorTime - b.latestErrorTime)

  // Use Map for correct ranking with duplicate values
  const errorCountRankMap = new Map(errorCountRankings.map((item, i) => [item, i + 1]))
  const latestErrorTimeRankMap = new Map(latestErrorTimeRankings.map((item, i) => [item, i + 1]))

  const errorDataWithRank: TRankedErrorWordData[] = errorData.map((item) => ({
    ...item,
    errorCountScore: errorCountRankMap.get(item) ?? 0,
    latestErrorTimeScore: latestErrorTimeRankMap.get(item) ?? 0,
  }))

  const errorCountWeight = 0.6
  const latestErrorTimeWeight = 0.4

  // Higher score = more errors + more recent → review first
  const sortedWords: Word[] = errorDataWithRank
    .sort((a, b) => {
      const scoreA = a.errorCountScore * errorCountWeight + a.latestErrorTimeScore * latestErrorTimeWeight
      const scoreB = b.errorCountScore * errorCountWeight + b.latestErrorTimeScore * latestErrorTimeWeight
      return scoreB - scoreA
    })
    .map((item) => item.originData)

  const record = new ReviewRecord(dictID, sortedWords)

  await db.reviewRecords.put(record)
  return record
}

export async function putWordReviewRecord(record: ReviewRecord) {
  await db.reviewRecords.put(record)
}
