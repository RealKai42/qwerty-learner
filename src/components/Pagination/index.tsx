import { Listbox, Transition } from '@headlessui/react'
import type { FC } from 'react'
import { Fragment, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import NextIcon from '~icons/ooui/next-ltr'
import PrevIcon from '~icons/ooui/next-rtl'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

type IPaginationProps = {
  className?: string
  page: number
  setPage: (page: number) => void
  totalPages: number
  totalItems?: number
  itemPerPage?: number
  setItemPerPage?: (itemPerPage: number) => void
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// 当前页左右各保留 WINDOW_SIZE 个页码；总页数不超过 MAX_PAGES 时全部展示、不加省略号
const WINDOW_SIZE = 1
const MAX_PAGES = 7

type PageItem = number | 'ellipsis'

function getPageList(page: number, totalPages: number): PageItem[] {
  if (totalPages <= MAX_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set<number>([1, totalPages])
  const lo = Math.max(2, page - WINDOW_SIZE)
  const hi = Math.min(totalPages - 1, page + WINDOW_SIZE)
  for (let p = lo; p <= hi; p++) pages.add(p)

  const sorted = [...pages].sort((a, b) => a - b)
  const out: PageItem[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('ellipsis')
    out.push(p)
    prev = p
  }
  return out
}

const Pagination: FC<IPaginationProps> = ({ className, page, setPage, totalPages, totalItems, itemPerPage, setItemPerPage }) => {
  const { t } = useTranslation()
  const pageList = useMemo(() => getPageList(page, totalPages), [page, totalPages])
  const isPrevDisabled = page <= 1
  const isNextDisabled = page >= totalPages

  const nextPage = useCallback(() => {
    setPage(page + 1)
  }, [page, setPage])

  const prevPage = useCallback(() => {
    setPage(page - 1)
  }, [page, setPage])

  const navBtnClass =
    'cursor-pointer rounded-full bg-white p-2 text-indigo-500 shadow-md transition-opacity ' +
    'dark:bg-gray-800 dark:text-indigo-300 disabled:cursor-default disabled:opacity-40 disabled:shadow-none'

  const pageBtnClass = (active: boolean) =>
    active
      ? 'h-8 min-w-8 cursor-pointer rounded-full bg-indigo-500 px-2 text-sm text-white shadow-md dark:bg-indigo-400'
      : 'h-8 min-w-8 cursor-pointer rounded-full bg-white px-2 text-sm text-indigo-500 shadow-md hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {totalPages > 1 && (
        <>
          <button
            type="button"
            className={navBtnClass}
            onClick={prevPage}
            disabled={isPrevDisabled}
            aria-label={t('pagination.previous')}
          >
            <PrevIcon />
          </button>
          {pageList.map((p, i) =>
            p === 'ellipsis' ? (
              // 省略号后必接页码（相邻两个省略号不可能连续出现），以其后页码作唯一 key
              <span key={`ellipsis-${pageList[i + 1]}`} className="px-0.5 text-black dark:text-white" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                className={pageBtnClass(p === page)}
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className={navBtnClass}
            onClick={nextPage}
            disabled={isNextDisabled}
            aria-label={t('pagination.next')}
          >
            <NextIcon />
          </button>
        </>
      )}
      {totalItems !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('pagination.total', { count: totalItems })}</span>
      )}
      {setItemPerPage !== undefined && (
        <Listbox value={itemPerPage} onChange={setItemPerPage}>
          <div className="relative">
            <Listbox.Button className="flex h-8 cursor-pointer items-center gap-1 rounded-full bg-white px-3 text-sm text-indigo-500 shadow-md focus:outline-none dark:bg-gray-800 dark:text-indigo-300">
              <span>{t('pagination.perPage')}</span>
              <span>{itemPerPage}</span>
              <IconChevronDown className="h-4 w-4" />
            </Listbox.Button>
            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="listbox-options absolute bottom-full right-0 z-10 mb-1 w-28">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <Listbox.Option key={size} value={size}>
                    {({ selected }) => (
                      <div className="group flex cursor-pointer items-center justify-between">
                        {selected ? (
                          <span className="listbox-options-icon">
                            <IconCheck className="focus:outline-none" />
                          </span>
                        ) : null}
                        <span>{t('pagination.perPageOption', { count: size })}</span>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </div>
  )
}

export default Pagination
