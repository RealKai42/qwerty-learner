import type { Dictionary, Word } from '@/typings'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useMemo } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const { data: wordList, error, isLoading } = useSWR(dict?.url, wordListFetcher)

  const word: Word | undefined = useMemo(() => {
    if (!wordList) return undefined

    const found = wordList.find((item) => item.name === name)
    return found
  }, [wordList, name])

  // Derive the error flag from the SWR error and lookup result instead of calling setState during render.
  const hasError = !!error || (!!wordList && !word)

  return { word, isLoading, hasError }
}
