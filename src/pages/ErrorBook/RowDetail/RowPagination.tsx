import { currentRowDetailAtom } from '../store'
import type { groupedWordRecords } from '../type'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import NextIcon from '~icons/ooui/next-ltr'
import PrevIcon from '~icons/ooui/next-rtl'

type IRowPaginationProps = {
  className?: string
  allRecords: groupedWordRecords[]
}

export const ITEM_PER_PAGE = 20

const RowPagination: FC<IRowPaginationProps> = ({ className, allRecords }) => {
  const [currentRowDetail, setCurrentRowDetail] = useAtom(currentRowDetailAtom)
  const currentIndex = useMemo(() => {
    if (!currentRowDetail) return -1
    return allRecords.findIndex((record) => record.word === currentRowDetail.word && record.dict === currentRowDetail.dict)
  }, [currentRowDetail, allRecords])

  const nextRowDetail = useCallback(() => {
    if (!currentRowDetail) return

    const index = currentIndex
    if (index === -1) return
    const nextIndex = index + 1
    if (nextIndex >= allRecords.length) return
    setCurrentRowDetail(allRecords[nextIndex])
  }, [currentRowDetail, currentIndex, allRecords, setCurrentRowDetail])

  const prevRowDetail = useCallback(() => {
    if (!currentRowDetail) return

    const index = currentIndex
    if (index === -1) return
    const prevIndex = index - 1
    if (prevIndex < 0) return
    setCurrentRowDetail(allRecords[prevIndex])
  }, [currentRowDetail, currentIndex, setCurrentRowDetail, allRecords])

  useHotkeys(
    'left',
    (e) => {
      prevRowDetail()
      e.stopPropagation()
    },
    {
      preventDefault: true,
    },
  )

  useHotkeys(
    'right',
    (e) => {
      nextRowDetail()
      e.stopPropagation()
    },
    {
      preventDefault: true,
    },
  )

  return (
    <div className={`-gap-1 flex select-none items-center ${className}`}>
      <button
        className="d cursor-pointer rounded-full  p-1  text-indigo-500 focus:outline-none dark:text-indigo-300"
        onClick={prevRowDetail}
      >
        <PrevIcon />
      </button>
      <span className="text-sm text-black dark:text-white">{`${currentIndex + 1} / ${allRecords.length}`}</span>
      <button className="cursor-pointer rounded-full p-1 text-indigo-500  focus:outline-none dark:text-indigo-300" onClick={nextRowDetail}>
        <NextIcon />
      </button>
    </div>
  )
}

export default RowPagination
