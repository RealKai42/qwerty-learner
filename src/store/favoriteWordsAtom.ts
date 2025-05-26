import type { Word } from '@/typings'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 定义收藏单词的类型
export interface FavoriteWord extends Word {
  addedAt: string // 添加时间
  dictId: string // 来源词典ID
}

// 使用 atomWithStorage 自动处理 localStorage 持久化
export const favoriteWordsAtom = atomWithStorage<FavoriteWord[]>('favoriteWords', [])

// 创建一个派生atom来检查特定单词是否已收藏
export const isWordFavoriteAtom = (word: Word, dictId: string) => {
  return atom((get) => {
    const favoriteWords = get(favoriteWordsAtom)
    return favoriteWords.some((w) => w.name === word.name && w.dictId === dictId)
  })
}

// 添加单词到收藏夹
export const addToFavoritesAtom = (word: Word, dictId: string) => {
  return atom(null, (get, set) => {
    const favoriteWords = get(favoriteWordsAtom)
    if (!favoriteWords.some((w) => w.name === word.name)) {
      set(favoriteWordsAtom, [
        ...favoriteWords,
        {
          ...word,
          addedAt: new Date().toISOString(),
          dictId,
        },
      ])
    }
  })
}

// 从收藏夹移除单词
export const removeFromFavoritesAtom = (word: Word) => {
  return atom(null, (get, set) => {
    const favoriteWords = get(favoriteWordsAtom)
    set(
      favoriteWordsAtom,
      favoriteWords.filter((w) => w.name !== word.name),
    )
  })
}

// 创建一个派生atom来检查特定单词是否已收藏
export const createIsWordFavoritedAtom = (word: Word, dictId: string) =>
  atom((get) => {
    const favorites = get(favoriteWordsAtom)
    const isFavorited = favorites.some((fav) => fav.name === word.name && fav.dictId === dictId)
    return isFavorited
  })

// 添加/移除收藏的操作函数
export const toggleFavoriteWordAtom = atom(null, (get, set, { word, dictId }: { word: Word; dictId: string }) => {
  console.log('Toggling favorite for:', word.name, 'dictId:', dictId)

  const favorites = get(favoriteWordsAtom)
  const existingIndex = favorites.findIndex((fav) => fav.name === word.name && fav.dictId === dictId)

  if (existingIndex >= 0) {
    // 已收藏，移除
    const newFavorites = favorites.filter((_, index) => index !== existingIndex)
    set(favoriteWordsAtom, newFavorites)
    console.log('Removed from favorites. New count:', newFavorites.length)
    return false
  } else {
    // 未收藏，添加
    const favoriteWord: FavoriteWord = {
      ...word,
      addedAt: new Date().toISOString(),
      dictId,
    }
    const newFavorites = [...favorites, favoriteWord]
    set(favoriteWordsAtom, newFavorites)
    console.log('Added to favorites. New count:', newFavorites.length)
    return true
  }
})

// 清空所有收藏
export const clearAllFavoritesAtom = atom(null, (get, set) => {
  set(favoriteWordsAtom, [])
  console.log('Cleared all favorites')
})

// 移除特定收藏单词
export const removeFavoriteWordAtom = atom(null, (get, set, { word, dictId }: { word: Word; dictId: string }) => {
  const favorites = get(favoriteWordsAtom)
  const newFavorites = favorites.filter((fav) => !(fav.name === word.name && fav.dictId === dictId))
  set(favoriteWordsAtom, newFavorites)
  console.log('Removed word:', word.name, 'New count:', newFavorites.length)
})
