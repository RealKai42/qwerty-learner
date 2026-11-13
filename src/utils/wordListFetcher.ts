import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  const response = await fetch(URL_PREFIX + url)
  if (!response.ok) {
    throw new Error(`Failed to fetch word list: HTTP ${response.status}`)
  }
  const words: Word[] = await response.json()
  if (!Array.isArray(words)) {
    throw new Error('Invalid word list format: expected array')
  }
  return words
}
