import Tooltip from '@/components/Tooltip'
import { createIsWordFavoritedAtom, currentDictIdAtom, toggleFavoriteWordAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue, useSetAtom } from 'jotai'
import { forwardRef, useCallback, useMemo } from 'react'
import IconHeart from '~icons/lucide/heart'
import IconHeartOff from '~icons/lucide/heart-off'

interface FavoriteButtonProps {
  word: Word
  className?: string
  allowUnfavorite?: boolean // 是否允许取消收藏
}

const FavoriteButton = forwardRef<HTMLButtonElement, FavoriteButtonProps>(({ word, className = '', allowUnfavorite = false }, ref) => {
  const currentDictId = useAtomValue(currentDictIdAtom)
  const toggleFavorite = useSetAtom(toggleFavoriteWordAtom)

  // 创建特定于当前单词的收藏状态atom
  const isWordFavoritedAtom = useMemo(() => {
    // 如果当前在收藏夹中练习，使用 'favorites' 作为 dictId
    const dictId = currentDictId === 'favorites' ? 'favorites' : currentDictId
    return createIsWordFavoritedAtom(word, dictId)
  }, [word, currentDictId])

  const isFavorited = useAtomValue(isWordFavoritedAtom)

  const handleToggleFavorite = useCallback(() => {
    console.log('FavoriteButton clicked:', word.name, 'isFavorited:', isFavorited, 'allowUnfavorite:', allowUnfavorite)

    // 在打字页面时也允许取消收藏
    if (!isFavorited || allowUnfavorite || currentDictId !== 'favorites') {
      // 如果当前在收藏夹中练习，使用 'favorites' 作为 dictId
      const dictId = currentDictId === 'favorites' ? 'favorites' : currentDictId
      toggleFavorite({ word, dictId })
    }
  }, [toggleFavorite, word, currentDictId, isFavorited, allowUnfavorite])

  // 如果不允许取消收藏且已收藏，则禁用按钮
  const isDisabled = isFavorited && !allowUnfavorite && currentDictId === 'favorites'

  const getTooltipText = () => {
    if (isFavorited) {
      return allowUnfavorite || currentDictId !== 'favorites' ? '取消收藏' : '已收藏'
    }
    return '收藏单词（F5）'
  }

  const getIcon = () => {
    if (isFavorited && (allowUnfavorite || currentDictId !== 'favorites')) {
      return <IconHeartOff className="h-5 w-5 text-red-500 hover:text-gray-400" />
    }
    return <IconHeart className={`h-5 w-5 ${isFavorited ? 'fill-current text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
  }

  return (
    <Tooltip content={getTooltipText()}>
      <button
        ref={ref}
        onClick={handleToggleFavorite}
        disabled={isDisabled}
        className={`flex items-center justify-center p-2 transition-all duration-200 ${
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
        } ${className}`}
        aria-label={getTooltipText()}
      >
        {getIcon()}
      </button>
    </Tooltip>
  )
})

FavoriteButton.displayName = 'FavoriteButton'

export default FavoriteButton
