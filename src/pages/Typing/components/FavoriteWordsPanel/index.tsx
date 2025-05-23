import FavoriteButton from '../FavoriteButton'
import Drawer from '@/components/Drawer'
import Tooltip from '@/components/Tooltip'
import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { idDictionaryMap } from '@/resources/dictionary'
import { type FavoriteWord, clearAllFavoritesAtom, favoriteWordsAtom, removeFavoriteWordAtom } from '@/store'
import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo, useRef, useState } from 'react'
import IconHeart from '~icons/lucide/heart'
import IconTrash from '~icons/lucide/trash-2'
import IconClear from '~icons/lucide/x'

interface FavoriteWordsPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface FavoriteWordItemProps {
  word: FavoriteWord
  onRemove: (word: FavoriteWord) => void
}

function FavoriteWordItem({ word, onRemove }: FavoriteWordItemProps) {
  const dictInfo = idDictionaryMap[word.dictId]
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)

  const handleRemove = useCallback(() => {
    onRemove(word)
  }, [word, onRemove])

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{word.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{dictInfo?.name || '未知词典'}</span>
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{word.trans.join('；')}</div>
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">收藏于 {dayjs(word.addedAt).format('YYYY-MM-DD HH:mm')}</div>
      </div>
      <div className="ml-2 flex items-center gap-1">
        <WordPronunciationIcon word={word} lang={dictInfo?.language || 'en'} className="h-8 w-8" ref={wordPronunciationIconRef} />
        <FavoriteButton word={word} allowUnfavorite={true} />
        <Tooltip content="删除记录">
          <button
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <IconTrash className="h-4 w-4 text-red-500" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default function FavoriteWordsPanel({ isOpen, onClose }: FavoriteWordsPanelProps) {
  const favoriteWords = useAtomValue(favoriteWordsAtom)
  const removeFavorite = useSetAtom(removeFavoriteWordAtom)
  const clearAllFavorites = useSetAtom(clearAllFavoritesAtom)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const sortedWords = useMemo(() => {
    return [...favoriteWords].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
  }, [favoriteWords])

  const handleRemoveWord = useCallback(
    (word: FavoriteWord) => {
      removeFavorite({ word, dictId: word.dictId })
    },
    [removeFavorite],
  )

  const handleClearAll = useCallback(() => {
    if (showConfirmClear) {
      clearAllFavorites()
      setShowConfirmClear(false)
    } else {
      setShowConfirmClear(true)
      // 3秒后自动取消确认状态
      setTimeout(() => setShowConfirmClear(false), 3000)
    }
  }, [clearAllFavorites, showConfirmClear])

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      placement="right"
      classNames="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <IconHeart className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">收藏的单词 ({favoriteWords.length})</h2>
          </div>
          <div className="flex items-center gap-2">
            {favoriteWords.length > 0 && (
              <Tooltip content={showConfirmClear ? '再次点击确认清空' : '清空所有收藏'}>
                <button
                  onClick={handleClearAll}
                  className={`rounded px-3 py-1 text-sm transition-colors ${
                    showConfirmClear
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {showConfirmClear ? '确认清空' : '清空全部'}
                </button>
              </Tooltip>
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <IconClear className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedWords.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <IconHeart className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-lg">还没有收藏的单词</p>
              <p className="mt-2 text-center text-sm">在学习过程中点击单词旁的心形图标即可收藏单词</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedWords.map((word, index) => (
                <FavoriteWordItem key={`${word.name}-${word.dictId}-${index}`} word={word} onRemove={handleRemoveWord} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
