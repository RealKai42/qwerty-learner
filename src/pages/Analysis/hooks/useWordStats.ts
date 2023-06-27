import { db } from '@/utils/db'
import type { IWordRecord } from '@/utils/db/record'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

interface IWordStats {
  exerciseRecord: [string, number][]
  wordRecord: [string, number][]
  wpmRecord: [string, number][]
  accuracyRecord: [string, number][]
}

export function useWordStats(startTimeStamp: number, endTimeStamp: number) {
  const [wordStats, setWordStats] = useState<IWordStats>({ exerciseRecord: [], wordRecord: [], wpmRecord: [], accuracyRecord: [] })

  useEffect(() => {
    const fetchWordStats = async () => {
      const stats = await getChapterStats(startTimeStamp, endTimeStamp)
      setWordStats(stats)
    }

    fetchWordStats()
  }, [startTimeStamp, endTimeStamp])

  return wordStats
}

async function getChapterStats(startTimeStamp: number, endTimeStamp: number): Promise<IWordStats> {
  // indexedDB查找某个数字范围内的数据
  const records: IWordRecord[] = await db.wordRecords.where('timeStamp').between(startTimeStamp, endTimeStamp).toArray()

  const data: {
    [x: string]: {
      exerciseTime: number //练习次数
      words: string[] //练习词数组（不去重）
      totalTime: number //总计用时
      wrongCount: number //错误次数
    }
  } = {}

  for (let i = 0; i < records.length; i++) {
    const date = dayjs(records[i].timeStamp * 1000).format('YYYY-MM-DD')

    if (!data[date]) {
      data[date] = { exerciseTime: 0, words: [], totalTime: 0, wrongCount: 0 }
    }

    data[date].exerciseTime = data[date].exerciseTime + 1
    data[date].words = [...data[date].words, records[i].word]
    data[date].totalTime = data[date].totalTime + records[i].timing.reduce((acc, curr) => acc + curr, 0)
    data[date].wrongCount = data[date].wrongCount + records[i].wrongCount
  }

  const RecordArray = Object.entries(data)

  // 练习次数统计
  const exerciseRecord: IWordStats['exerciseRecord'] = RecordArray.map(([date, { exerciseTime }]) => [date, exerciseTime])
  // 练习词数统计（去重）
  const wordRecord: IWordStats['wordRecord'] = RecordArray.map(([date, { words }]) => [date, Array.from(new Set(words)).length])
  // wpm=练习词数（不去重）/总时间
  const wpmRecord: IWordStats['wpmRecord'] = RecordArray.map(([date, { words, totalTime }]) => [
    date,
    Math.round(words.length / (totalTime / 1000 / 60)),
  ])
  // 正确率=每个单词的长度合计/(每个单词的长度合计+总错误次数)
  const accuracyRecord: IWordStats['accuracyRecord'] = RecordArray.map(([date, { words, wrongCount }]) => [
    date,
    Math.round((words.join('').length / (words.join('').length + wrongCount)) * 100),
  ])

  return { exerciseRecord, wordRecord, wpmRecord, accuracyRecord }
}
