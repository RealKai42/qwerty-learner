import Tooltip from '@/components/Tooltip'
import { favoriteWordsAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import IconHeart from '~icons/lucide/heart'

interface FavoriteListButtonProps {
  onClick: () => void
  className?: string
}

export default function FavoriteListButton({ onClick, className = '' }: FavoriteListButtonProps) {
  const favoriteWords = useAtomValue(favoriteWordsAtom)

  const favoriteCount = useMemo(() => favoriteWords.length, [favoriteWords])

  return (
    <Tooltip content="查看收藏的单词">
      <button onClick={onClick} className={`my-btn-primary relative flex items-center gap-2 ${className}`}>
        <IconHeart className="h-4 w-4" />
        <span>收藏</span>
        {favoriteCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {favoriteCount > 99 ? '99+' : favoriteCount}
          </span>
        )}
      </button>
    </Tooltip>
  )
}
