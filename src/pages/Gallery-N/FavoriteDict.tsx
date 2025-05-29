import DictionaryComponent from './DictionaryWithoutCover'
import { favoriteWordsAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import IconHeart from '~icons/lucide/heart'

export default function FavoriteDict() {
  const favoriteWords = useAtomValue(favoriteWordsAtom)

  const favoriteDict = useMemo(() => {
    return {
      id: 'favorites',
      name: '收藏夹',
      description: `已收藏 ${favoriteWords.length} 个单词`,
      category: '收藏夹',
      tags: ['收藏'],
      url: '/dicts/favorites.json',
      length: favoriteWords.length,
      language: 'en' as const,
      languageCategory: 'en' as const,
      chapterCount: 1,
    }
  }, [favoriteWords])

  if (favoriteWords.length === 0) {
    return (
      <div className="flex h-40 w-80 items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <IconHeart className="mb-2 h-8 w-8 text-gray-400" />
          <p>暂无收藏的单词</p>
        </div>
      </div>
    )
  }

  return <DictionaryComponent dictionary={favoriteDict} />
}
