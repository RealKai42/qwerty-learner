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

  // 计算每个对象的排名得分
  const errorDataWithRank: TRankedErrorWordData[] = errorData.map((item) => ({
    ...item,
    errorCountScore: errorCountRankings.indexOf(item) + 1,
    latestErrorTimeScore: latestErrorTimeRankings.indexOf(item) + 1,
  }))

  // 根据加权排名进行排序
  const errorCountWeight = 0.6
  const latestErrorTimeWeight = 0.4

  const sortedWords: Word[] = errorDataWithRank
    .sort((a, b) => {
      // 计算 a 和 b 的得分
      const scoreA = a.errorCountScore * errorCountWeight + a.latestErrorTimeScore * latestErrorTimeWeight
      const scoreB = b.errorCountScore * errorCountWeight + b.latestErrorTimeScore * latestErrorTimeWeight

      // 根据得分进行排序
      return scoreA - scoreB
    })
    .map((item) => item.originData)

  const record = new ReviewRecord(dictID, sortedWords)

  await db.reviewRecords.put(record)
  return record
}

export async function putWordReviewRecord(record: ReviewRecord) {
  db.reviewRecords.put(record)
}
