import { useAtomValue } from 'jotai'
import cet4 from '@/assets/CET4_T.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { LanguageType } from '@/typings/index'
import { randomConfigAtom, currentDictInfoAtom, currentChapterAtom } from '@/store'
import { CHAPTER_LENGTH } from '@/constants'

export type Word = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

export type UseWordListResult = {
  dictName: string
  chapter: number
  chapterListLength: number
  words: Word[]
  language: LanguageType
  defaultPronIndex?: number
  setChapterNumber: (index: number) => void
}

/**
 * Use word lists from the current selected dictionary.
 * When the data is loading, this returns `undefined`.
 */
export function useWordList(): Word[] | undefined {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const randomConfig = useAtomValue(randomConfigAtom)
  const { data: wordList } = useSWR([currentDictInfo.url, currentDictInfo.id], ([url, id]) => wordListFetcher(url, id))

  const words = useMemo(
    () => (wordList ? wordList.slice(currentChapter * CHAPTER_LENGTH, (currentChapter + 1) * CHAPTER_LENGTH) : []),
    [wordList, currentChapter],
  )
  const shuffleWords = useMemo(() => (randomConfig.isOpen ? shuffle(words) : words), [randomConfig.isOpen, words])

  return wordList === undefined ? undefined : shuffleWords
}

async function wordListFetcher(url: string, id: string): Promise<Word[]> {
  if (id === 'cet4') {
    return cet4
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return words
  }
}
