import { SOUND_URL_PREFIX, favoriteSoundResources, unfavoriteSoundResources } from '@/resources/soundResource'
import { hintSoundsConfigAtom } from '@/store'
import { recordFavoriteAction } from '@/utils'
import { FAVORITES_SWR_KEY, getFavoriteRecords, toggleFavoriteRecord } from '@/utils/db/favorites'
import type { IFavoriteRecord } from '@/utils/db/record'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSound from 'use-sound'

export { FAVORITES_SWR_KEY } from '@/utils/db/favorites'

const favoriteFetcher = async (): Promise<IFavoriteRecord[]> => getFavoriteRecords()

/**
 * 收藏单词 hook。SWR 全局缓存, 打字界面 / Drawer / 收藏页三处共享同一份数据。
 */
export function useFavorite() {
  const { mutate } = useSWRConfig()
  const { data: favorites, isLoading } = useSWR<IFavoriteRecord[]>(FAVORITES_SWR_KEY, favoriteFetcher)
  const { isOpen, volume } = useAtomValue(hintSoundsConfigAtom)
  const [playFavoriteSound] = useSound(`${SOUND_URL_PREFIX}${favoriteSoundResources[0].filename}`, { volume, interrupt: true })
  const [playUnfavoriteSound] = useSound(`${SOUND_URL_PREFIX}${unfavoriteSoundResources[0].filename}`, { volume, interrupt: true })

  const isFavorite = useCallback((word: string, dict: string) => !!favorites?.some((f) => f.word === word && f.dict === dict), [favorites])

  // 幂等 toggle: 已有则取消收藏, 无则添加。返回收藏后是否处于收藏状态
  const toggle = useCallback(
    async (word: string, dict: string, chapter: number | null): Promise<boolean> => {
      const added = await toggleFavoriteRecord(word, dict, chapter)
      await mutate(FAVORITES_SWR_KEY)
      if (isOpen) {
        if (added) playFavoriteSound()
        else playUnfavoriteSound()
      }
      recordFavoriteAction(added ? 'add' : 'remove')
      return added
    },
    [mutate, isOpen, playUnfavoriteSound, playFavoriteSound],
  )

  return { favorites, isLoading, isFavorite, toggle }
}
