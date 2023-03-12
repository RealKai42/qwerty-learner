import { useAtomValue } from 'jotai'
import cet4 from '@/assets/CET4_T.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { LanguageType } from '@/typings/index'
import { randomConfigAtom, currentDictInfoAtom, currentChapterAtom } from '@/store'

export type Word = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

const numWordsPerChapter = 20

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
    () => (wordList ? wordList.words.slice(currentChapter * numWordsPerChapter, (currentChapter + 1) * numWordsPerChapter) : []),
    [wordList, currentChapter],
  )
  const shuffleWords = useMemo(() => (randomConfig.isOpen ? shuffle(words) : words), [randomConfig.isOpen, words])

  return wordList === undefined ? undefined : shuffleWords
}

type WordList = {
  words: Word[]
  totalChapters: number
}

async function wordListFetcher(url: string, id: string): Promise<WordList> {
  if (id === 'cet4') {
    return { words: cet4, totalChapters: Math.ceil(cet4.length / numWordsPerChapter) }
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) }
  }
}
