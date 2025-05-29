import { favoriteWordsAtom } from '@/store/favoriteWordsAtom'
import type { Word } from '@/typings'
import { getDefaultStore } from 'jotai'

export async function wordListFetcher(url: string): Promise<Word[]> {
  // 检查是否是收藏夹
  if (url.includes('favorites.json')) {
    const store = getDefaultStore()
    const favoriteWords = store.get(favoriteWordsAtom)
    return favoriteWords.map((word) => ({
      name: word.name,
      trans: word.trans,
      usphone: word.usphone,
      ukphone: word.ukphone,
      notation: word.notation,
    }))
  }

  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
  const response = await fetch(URL_PREFIX + url)
  const words: Word[] = await response.json()
  return words
}
