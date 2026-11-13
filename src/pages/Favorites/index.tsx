import ExportMenu from './ExportMenu'
import PracticeMenu from './PracticeMenu'
import FavoriteRow from './FavoriteRow'
import Pagination, { PAGE_SIZE_OPTIONS } from '@/components/Pagination'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useFavorite } from '@/hooks/useFavorite'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

const itemPerPageAtom = atomWithStorage('favoriteItemPerPage', PAGE_SIZE_OPTIONS[1])

export function Favorites() {
  const { t } = useTranslation()
  const { favorites = [], isLoading } = useFavorite()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemPerPage, setItemPerPage] = useAtom(itemPerPageAtom)
  const navigate = useNavigate()

  const totalPages = useMemo(() => Math.ceil(favorites.length / itemPerPage), [favorites.length, itemPerPage])

  const setPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return
      setCurrentPage(page)
    },
    [totalPages],
  )

  const renderFavorites = useMemo(() => {
    const start = (currentPage - 1) * itemPerPage
    const end = start + itemPerPage
    return favorites.slice(start, end)
  }, [currentPage, favorites, itemPerPage])

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])
  const viewportRef = useRef<HTMLDivElement>(null)

  // 取消收藏后列表变短，页码可能越界，回落到合法末页，避免空白页
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [totalPages, currentPage])

  // 翻页或改每页条数后重置列表滚动位置（改每页条数时 currentPage 可能仍是 1，故依赖需含 itemPerPage）
  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 })
  }, [currentPage, itemPerPage])

  if (favorites.length === 0 && !isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 pb-4">
        <h1 className="text-2xl text-gray-500 opacity-70">{t('favorites.empty')}</h1>
        <button type="button" onClick={onBack} className="my-btn-primary h-10 px-6">
          {t('favorites.goPractice')}
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center pb-4 ease-in">
      <div className="mr-8 mt-4 flex w-auto items-center justify-center self-end">
        <h1 className="font-lighter mr-4 w-auto self-end text-gray-500 opacity-70">{t('favorites.title')}</h1>
        <IconX className="h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
      </div>

      <div className="flex w-full flex-1 select-text items-start justify-center overflow-hidden">
        <div className="flex h-full w-11/12 flex-col pt-10 md:w-5/6">
          <div className="flex w-full justify-between gap-3 rounded-lg bg-white px-6 py-5 text-lg text-black shadow-lg dark:bg-gray-800 dark:text-white">
            <span className="min-w-0 basis-3/12 truncate">{t('favorites.word')}</span>
            <span className="min-w-0 basis-6/12">{t('favorites.translation')}</span>
            <span className="min-w-0 basis-2/12 truncate">{t('favorites.dictionary')}</span>
            <span className="min-w-0 basis-1/12" />
            <PracticeMenu favorites={favorites} />
            <ExportMenu favorites={favorites} />
          </div>
          <ScrollArea.Root className="flex-1 overflow-y-auto pt-5">
            <ScrollArea.Viewport ref={viewportRef} className="h-full">
              <ul className="flex flex-col gap-3">
                {renderFavorites.map((favorite) => (
                  <FavoriteRow key={`${favorite.dict}-${favorite.word}`} favorite={favorite} />
                ))}
              </ul>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical" />
          </ScrollArea.Root>
        </div>
      </div>
      <Pagination
          className="pt-3"
          page={currentPage}
          setPage={setPage}
          totalPages={totalPages}
          totalItems={favorites.length}
          itemPerPage={itemPerPage}
          setItemPerPage={(size) => {
            setItemPerPage(size)
            setCurrentPage(1)
          }}
        />
    </div>
  )
}
