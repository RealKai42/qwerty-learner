import cet4 from '@/assets/CET4_T.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import { useSelectedChapter, useSelectedDictionary, useRandomState } from '@/store/AppState'
import useSWR from 'swr'

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
  language: string
  setChapterNumber: (index: number) => void
}

/**
 * Use word lists from the current selected dictionary.
 * When the data is loading, this returns `undefined`.
 */
export function useWordList(): UseWordListResult | undefined {
  const selectedDictionary = useSelectedDictionary()
  const [random] = useRandomState()
  const [currentChapter, setCurrentChapter] = useSelectedChapter()
  const { data: wordList } = useSWR([selectedDictionary.id, selectedDictionary.url], fetchWordList)
  const words = useMemo(
    () => (wordList ? wordList.words.slice(currentChapter * numWordsPerChapter, (currentChapter + 1) * numWordsPerChapter) : []),
    [wordList, currentChapter],
  )
  const shuffleWords = useMemo(() => (random ? shuffle(words) : words), [random, words])
  return wordList === undefined
    ? undefined
    : {
        dictName: selectedDictionary.name,
        chapter: currentChapter,
        chapterListLength: wordList.totalChapters,
        words: shuffleWords,
        language: selectedDictionary.language,
        setChapterNumber: setCurrentChapter,
      }
}

type WordList = {
  words: Word[]
  totalChapters: number
}

async function fetchWordList(id: string, url: string): Promise<WordList> {
  if (id === 'cet4') {
    return { words: cet4, totalChapters: Math.ceil(cet4.length / numWordsPerChapter) }
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) }
  }
}
