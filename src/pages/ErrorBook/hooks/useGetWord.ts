import type { Dictionary, Word } from '@/typings'
import { archiveWordListUrl } from '@/utils/memo'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export default function useGetWord(name: string, dict: Dictionary) {
  const { data: wordList, error, isLoading } = useSWR(dict?.url ? archiveWordListUrl(dict.url) : null, wordListFetcher)
  const [hasError, setHasError] = useState(false)

  const word: Word | undefined = useMemo(() => {
    if (!wordList) return undefined

    const word = wordList.find((word) => word.name === name)
    if (word) {
      return word
    } else {
      setHasError(true)
      return undefined
    }
  }, [wordList, name])

  useEffect(() => {
    if (error) setHasError(true)
  }, [error])

  return { word, isLoading, hasError }
}
