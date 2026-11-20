import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useMemo } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const { data: wordList, error, isLoading } = useSWR(dict?.url, wordListFetcher)

  const word: Word | undefined = useMemo(() => {
    if (!wordList) return undefined
    return wordList.find((item) => item.name === name)
  }, [wordList, name])

  // A missing word used to call setState inside this memo, which updates state during render.
  const hasError = Boolean(error) || (wordList != null && word == null)

  return { word, isLoading, hasError }
}
