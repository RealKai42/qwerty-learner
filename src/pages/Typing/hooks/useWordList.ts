import cet4 from 'assets/CET4_T.json'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import { useSelectedChapter, useSelectedDictionary, useRandomState } from 'store/AppState'
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
  } else if (id === 'youdao') {
    const { total, wordConfig } = await fetchYoudaoList()
    return wordConfig
  } else {
    const response = await fetch(url)
    const words: Word[] = await response.json()
    return { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) }
  }
}
type YoudaoResp = {
  data: {
    total: number
    itemList: Item[]
  }
}
type Item = {
  word: string
  trans: string
  phonetic: string
}

async function fetchYoudaoList() {
  const response = await fetch('https://mahoo12138.cn/api/youdao/words', {
    method: 'GET',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
    },
  })
  const { data }: YoudaoResp = await response.json()
  const words = data.itemList.map((item) => ({
    name: item.word,
    trans: item.trans.split(';'),
    usphone: item.phonetic,
    ukphone: item.phonetic,
  }))
  return {
    total: data.total,
    wordConfig: { words, totalChapters: Math.ceil(words.length / numWordsPerChapter) },
  }
}
