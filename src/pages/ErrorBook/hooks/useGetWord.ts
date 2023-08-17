import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useMemo } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const { data: wordList, error, isLoading } = useSWR(dict.url, wordListFetcher)

  const word: Word | undefined = useMemo(() => {
    if (!wordList) return undefined

    return wordList.find((word) => word.name === name)
  }, [wordList, name])

  return { word, isLoading, error }
}
