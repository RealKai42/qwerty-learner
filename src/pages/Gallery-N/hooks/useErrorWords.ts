import type { Dictionary, Word } from '@/typings'
import { db } from '@/utils/db'
import type { WordRecord } from '@/utils/db/record'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

type groupRecord = {
  word: string
  records: WordRecord[]
}

export type TErrorWordData = {
  word: string
  originData: Word
  errorCount: number
  errorLetters: Record<string, number>
  errorChar: string[]
  latestErrorTime: number
}

export default function useErrorWordData(dict: Dictionary) {
  const { data: wordList, error, isLoading } = useSWR(dict?.url, wordListFetcher)

  const [errorWordData, setErrorData] = useState<TErrorWordData[]>([])

  useEffect(() => {
    if (!wordList) return

    db.wordRecords
      .where('wrongCount')
      .above(0)
      .filter((record) => record.dict === dict.id)
      .toArray()
      .then((records) => {
        const groupRecords: groupRecord[] = []

        records.forEach((record) => {
          let groupRecord = groupRecords.find((g) => g.word === record.word)
          if (!groupRecord) {
            groupRecord = { word: record.word, records: [] }
            groupRecords.push(groupRecord)
          }
          groupRecord.records.push(record as WordRecord)
        })

        const res: TErrorWordData[] = []

        groupRecords.forEach((groupRecord) => {
          const errorLetters = {} as Record<string, number>
          groupRecord.records.forEach((record) => {
            for (const index in record.mistakes) {
              const mistakes = record.mistakes[index]
              if (mistakes.length > 0) {
                errorLetters[index] = (errorLetters[index] ?? 0) + mistakes.length
              }
            }
          })

          const word = wordList.find((word) => word.name === groupRecord.word)
          if (!word) return

          const errorData: TErrorWordData = {
            word: groupRecord.word,
            originData: word,
            errorCount: groupRecord.records.reduce((acc, cur) => {
              acc += cur.wrongCount
              return acc
            }, 0),
            errorLetters,
            errorChar: Object.entries(errorLetters)
              .sort((a, b) => b[1] - a[1])
              .map(([index]) => groupRecord.word[Number(index)]),

            latestErrorTime: groupRecord.records.reduce((acc, cur) => {
              acc = Math.max(acc, cur.timeStamp)
              return acc
            }, 0),
          }
          res.push(errorData)
        })

        setErrorData(res)
      })
  }, [dict.id, wordList])

  return { errorWordData, isLoading, error }
}
