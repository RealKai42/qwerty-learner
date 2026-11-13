import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import { buildFavoriteWords } from '@/utils/favorites-practice'
import { ReviewRecord } from '@/utils/db/record'
import type { IFavoriteRecord } from '@/utils/db/record'
import { idDictionaryMap } from '@/resources/dictionary'
import type { Dictionary } from '@/typings'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSetAtom } from 'jotai'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type PracticeMenuProps = {
  favorites: IFavoriteRecord[]
}

const PracticeMenu: FC<PracticeMenuProps> = ({ favorites }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const [isStarting, setIsStarting] = useState(false)

  // 按词库聚合收藏数, 过滤掉已不存在的词库
  const dictCounts = useMemo(() => {
    const countMap = new Map<string, number>()
    favorites.forEach((f) => countMap.set(f.dict, (countMap.get(f.dict) ?? 0) + 1))
    return [...countMap.entries()]
      .map(([dictId, count]) => ({ dict: idDictionaryMap[dictId], count }))
      .filter((item): item is { dict: Dictionary; count: number } => !!item.dict)
  }, [favorites])

  const startPractice = useCallback(
    async (dict: Dictionary) => {
      if (isStarting) return
      setIsStarting(true)
      try {
        const words = await buildFavoriteWords(favorites, dict)
        if (!words.length) {
          alert(t('favorites.practiceEmpty'))
          return
        }
        setCurrentDictId(dict.id)
        setCurrentChapter(-1)
        // 不带 id, reviewInfoAtom 不会写入 IndexedDB, 不污染该词库的错题复习记录
        setReviewModeInfo({ isReviewMode: true, reviewRecord: new ReviewRecord(dict.id, words) })
        navigate('/')
      } catch (error) {
        console.error('Failed to start favorite practice:', error)
        alert(t('favorites.practiceFailed'))
      } finally {
        setIsStarting(false)
      }
    },
    [isStarting, favorites, t, setCurrentDictId, setCurrentChapter, setReviewModeInfo, navigate],
  )

  if (dictCounts.length === 0) return null

  return (
    <div className="z-10 shrink-0">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="my-btn-primary h-8 shadow transition hover:bg-indigo-600 disabled:opacity-50" disabled={isStarting}>
            {t('favorites.practice')}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="mt-1 rounded bg-indigo-500 text-white shadow-lg">
          {dictCounts.map(({ dict, count }) => (
            <DropdownMenu.Item
              key={dict.id}
              className="cursor-pointer rounded px-4 py-2 hover:bg-indigo-400 focus:bg-indigo-600 focus:outline-none"
              onClick={() => void startPractice(dict)}
              disabled={isStarting}
            >
              {`${dict.name} (${count})`}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default PracticeMenu
