import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  const response = await fetch(URL_PREFIX + url)
  const words: Word[] = await response.json()
  return words
}
