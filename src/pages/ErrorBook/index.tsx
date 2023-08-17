import ErrorRow from './ErrorRow'
import type { ISortType } from './HeadWrongNumber'
import HeadWrongNumber from './HeadWrongNumber'
import Pagination, { ITEM_PER_PAGE } from './Pagination'
import type { groupedWordRecords } from './type'
import { db } from '@/utils/db'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function ErrorBook() {
  const [groupedRecords, setGroupedRecords] = useState<groupedWordRecords[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = useMemo(() => Math.ceil(groupedRecords.length / ITEM_PER_PAGE), [groupedRecords.length])
  const [sortType, setSortType] = useState<ISortType>('asc')

  const setPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return
      setCurrentPage(page)
    },
    [totalPages],
  )

  const setSort = useCallback(
    (sortType: ISortType) => {
      setSortType(sortType)
      setPage(1)
    },
    [setPage],
  )

  const sortedRecords = useMemo(() => {
    if (sortType === 'none') return groupedRecords
    return [...groupedRecords].sort((a, b) => {
      if (sortType === 'asc') {
        return a.wrongCount - b.wrongCount
      } else {
        return b.wrongCount - a.wrongCount
      }
    })
  }, [groupedRecords, sortType])

  useEffect(() => {
    db.wordRecords
      .where('wrongCount')
      .above(0)
      .toArray()
      .then((records) => {
        const groups: groupedWordRecords[] = []

        records.forEach((record) => {
          let group = groups.find((g) => g.word === record.word && g.dict === record.dict)
          if (!group) {
            group = { word: record.word, dict: record.dict, records: [], wrongCount: 0 }
            groups.push(group)
          }
          group.records.push(record)
        })

        groups.forEach((group) => {
          group.wrongCount = group.records.reduce((acc, cur) => {
            acc += cur.wrongCount
            return acc
          }, 0)
        })

        setGroupedRecords(groups)
      })
  }, [])

  const renderRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEM_PER_PAGE
    const end = start + ITEM_PER_PAGE
    return sortedRecords.slice(start, end)
  }, [currentPage, sortedRecords])

  return (
    <div className="flex h-screen w-full flex-col items-center pb-4">
      <div className="flex w-full flex-1 select-text items-start justify-center overflow-hidden">
        <div className="flex h-full w-5/6 flex-col pt-10">
          <div className="flex w-full justify-between rounded-lg bg-white px-6 py-5 text-lg shadow-lg">
            <span className="basis-2/12">单词</span>
            <span className="basis-6/12">释义</span>
            <HeadWrongNumber className="basis-1/12" sortType={sortType} setSortType={setSort} />
            <span className="basis-2/12">词典</span>
          </div>
          <ScrollArea.Root className="flex-1 overflow-y-auto pt-5">
            <ScrollArea.Viewport className="h-full  ">
              <div className="flex flex-col gap-3">
                {renderRecords.map((record) => (
                  <ErrorRow key={`${record.dict}-${record.word}`} record={record} />
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical"></ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
      <Pagination className="pt-3" page={currentPage} setPage={setPage} />
    </div>
  )
}
