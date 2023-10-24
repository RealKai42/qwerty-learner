import { db } from '@/utils/db'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export function useChapterNumber() {
  const [chapterNumber, setChapterNumber] = useState<number>(0)

  useEffect(() => {
    const fetchChapterNumber = async () => {
      const number = await db.chapterRecords.count()
      setChapterNumber(number)
    }

    fetchChapterNumber()
  }, [])

  return chapterNumber
}

export function useDayFromFirstWordRecord() {
  const [dayFromFirstWordRecord, setDayFromFirstWordRecord] = useState<number>(0)

  useEffect(() => {
    const fetchDayFromFirstWordRecord = async () => {
      const firstWordRecord = await db.wordRecords.orderBy('timeStamp').first()
      const firstWordRecordTimeStamp = firstWordRecord?.timeStamp || 0
      const now = dayjs()
      const timestamp = dayjs.unix(firstWordRecordTimeStamp)
      const daysPassed = now.diff(timestamp, 'day')
      setDayFromFirstWordRecord(daysPassed)
    }

    fetchDayFromFirstWordRecord()
  }, [])

  return dayFromFirstWordRecord
}

export function useWordNumber() {
  const [wordNumber, setWordNumber] = useState<number>(0)

  useEffect(() => {
    const fetchWordNumber = async () => {
      const number = await db.wordRecords.count()
      setWordNumber(number)
    }

    fetchWordNumber()
  }, [])

  return wordNumber
}

export function useSumWrongCount() {
  const [sumWrongCount, setSumWrongCount] = useState<number>(0)

  useEffect(() => {
    const fetchSumWrongCount = async () => {
      let totalWrongCount = 0

      await db.chapterRecords.each((record) => {
        totalWrongCount += record.wrongCount || 0
      })
      setSumWrongCount(totalWrongCount)
    }

    fetchSumWrongCount()
  }, [])

  return sumWrongCount
}
