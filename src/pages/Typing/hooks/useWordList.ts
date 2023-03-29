import { useAtomValue } from 'jotai'
import cet4 from '@/assets/CET4_T.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Word } from '@/typings/index'
import { randomConfigAtom, currentDictInfoAtom, currentChapterAtom } from '@/store'
import { CHAPTER_LENGTH } from '@/constants'

export type UseWordListResult = {
  words: Word[] | undefined
  isLoading: boolean
  error: Error | undefined
}

/**
 * Use word lists from the current selected dictionary.
 */
export function useWordList(): UseWordListResult {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const { data: wordList, error, isLoading } = useSWR([currentDictInfo.url, currentDictInfo.id], ([url, id]) => wordListFetcher(url, id))

  const words = useMemo(
    () => (wordList ? wordList.slice(currentChapter * CHAPTER_LENGTH, (currentChapter + 1) * CHAPTER_LENGTH) : []),
    [wordList, currentChapter],
  )
  const shuffleWords = useMemo(() => (randomConfig.isOpen ? shuffle(words) : words), [randomConfig.isOpen, words])

  return { words: wordList === undefined ? undefined : shuffleWords, isLoading, error }
}

async function wordListFetcher(url: string, id: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  if (id === 'cet4') {
    return cet4
  } else {
    const response = await fetch(URL_PREFIX + url)
    const words: Word[] = await response.json()
    return words
  }
}
