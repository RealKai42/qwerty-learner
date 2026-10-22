import type { Word } from '@/typings'
import { db } from '@/utils/db/core'

export async function wordListFetcher(url: string): Promise<Word[]> {
  if (url.startsWith('custom-dictionary://')) {
    const parsed = new URL(url)
    const dictionary = await db.customDictionaries.get(parsed.hostname)
    if (!dictionary) throw new Error('个人词书不存在，请重新导入。')
    return parsed.searchParams.get('archive') === '1' ? dictionary.wordArchive : dictionary.words
  }
  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  const response = await fetch(URL_PREFIX + url)
  if (!response.ok) throw new Error('词书加载失败，请稍后重试。')
  const words: Word[] = await response.json()
  return words
}
