import DropdownExport from './DropdownExport'
import ErrorRow from './ErrorRow'
import type { ISortType } from './HeadWrongNumber'
import HeadWrongNumber from './HeadWrongNumber'
import Pagination, { ITEM_PER_PAGE } from './Pagination'
import RowDetail from './RowDetail'
import { currentRowDetailAtom } from './store'
import type { groupedWordRecords } from './type'
import { db, useDeleteWordRecord } from '@/utils/db'
import type { WordRecord } from '@/utils/db/record'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export function ErrorBook() {
  const [groupedRecords, setGroupedRecords] = useState<groupedWordRecords[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = useMemo(() => Math.ceil(groupedRecords.length / ITEM_PER_PAGE), [groupedRecords.length])
  const [sortType, setSortType] = useState<ISortType>('asc')
  const navigate = useNavigate()
  const currentRowDetail = useAtomValue(currentRowDetailAtom)
  const { deleteWordRecord } = useDeleteWordRecord()

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

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

  const renderRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEM_PER_PAGE
    const end = start + ITEM_PER_PAGE
    return sortedRecords.slice(start, end)
  }, [currentPage, sortedRecords])

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1)
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    db.wordRecords
      .where('wrongCount')
      .above(0)
      .toArray()
      .then((records) => {
        const groups = new Map<string, groupedWordRecords>()

        records.forEach((record) => {
          const key = JSON.stringify([record.dict, record.word])
          const currentGroup = groups.get(key)

          if (currentGroup) {
            currentGroup.records.push(record as WordRecord)
            currentGroup.wrongCount += record.wrongCount
            return
          }

          groups.set(key, {
            word: record.word,
            dict: record.dict,
            records: [record as WordRecord],
            wrongCount: record.wrongCount,
          })
        })

        setGroupedRecords(Array.from(groups.values()))
      })
  }, [])

  const handleDelete = async (word: string, dict: string) => {
    const deletedCount = await deleteWordRecord(word, dict)

    if (!deletedCount) return

    setGroupedRecords((prev) => prev.filter((record) => !(record.word === word && record.dict === dict)))
  }

  return (
    <>
      <div className={`relative flex h-screen w-full flex-col items-center pb-4 ease-in ${currentRowDetail && 'blur-sm'}`}>
        <div className="mr-8 mt-4 flex w-auto items-center justify-center self-end">
          <h1 className="font-lighter mr-4 w-auto self-end text-gray-500 opacity-70">Tip: 点击错误单词查看详细信息 </h1>
          <IconX className="h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        </div>

        <div className="flex w-full flex-1 select-text items-start justify-center overflow-hidden">
          <div className="flex h-full w-5/6 flex-col pt-10">
            <div className="flex w-full justify-between rounded-lg bg-white px-6 py-5 text-lg text-black shadow-lg dark:bg-gray-800 dark:text-white">
              <span className="basis-2/12">单词</span>
              <span className="basis-6/12">释义</span>
              <HeadWrongNumber className="basis-1/12" sortType={sortType} setSortType={setSort} />
              <span className="basis-1/12">词典</span>
              <DropdownExport renderRecords={sortedRecords} />
            </div>
            <ScrollArea.Root className="flex-1 overflow-y-auto pt-5">
              <ScrollArea.Viewport className="h-full  ">
                <div className="flex flex-col gap-3">
                  {renderRecords.map((record) => (
                    <ErrorRow
                      key={`${record.dict}-${record.word}`}
                      record={record}
                      onDelete={() => handleDelete(record.word, record.dict)}
                    />
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical"></ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        </div>
        <Pagination className="pt-3" page={currentPage} setPage={setPage} totalPages={totalPages} />
      </div>
      {currentRowDetail && <RowDetail currentRowDetail={currentRowDetail} allRecords={sortedRecords} />}
    </>
  )
}
