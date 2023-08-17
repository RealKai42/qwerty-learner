import type { FC } from 'react'
import { useCallback } from 'react'
import NextIcon from '~icons/ooui/next-ltr'
import PrevIcon from '~icons/ooui/next-rtl'

type IPaginationProps = {
  className?: string
  page: number
  setPage: (page: number) => void
}

export const ITEM_PER_PAGE = 20

const Pagination: FC<IPaginationProps> = ({ className, page, setPage }) => {
  const nextPage = useCallback(() => {
    setPage(page + 1)
  }, [page, setPage])

  const prevPage = useCallback(() => {
    setPage(page - 1)
  }, [page, setPage])

  return (
    <div className={`flex items-center gap-2  ${className}`}>
      <button className="cursor-pointer rounded-full bg-white p-2 text-indigo-500 shadow-md" onClick={prevPage}>
        <PrevIcon />
      </button>
      <span>{page}</span>
      <button className="cursor-pointer rounded-full bg-white p-2 text-indigo-500 shadow-md" onClick={nextPage}>
        <NextIcon />
      </button>
    </div>
  )
}

export default Pagination
