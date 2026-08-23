import { currentDictInfoAtom } from '@/store'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useSWR from 'swr'

export type UseGameWords = {
  gameWords: string[]
  isLoading: boolean
  error: Error | undefined
}

export default function useGameWordList(): UseGameWords {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  const { data: wordList, error, isLoading } = useSWR(currentDictInfo.url, wordListFetcher)

  const gameWords: string[] = useMemo(() => {
    if (!wordList || wordList.length < 1) return []
    return wordList.map((word) => word.name)
  }, [wordList])

  return useMemo(() => ({ gameWords, error, isLoading }), [gameWords, error, isLoading])
}
