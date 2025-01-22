import ErrorRow from './ErrorRow'
import type { ISortType } from './HeadWrongNumber'
import HeadWrongNumber from './HeadWrongNumber'
import Pagination from './Pagination'
import RowDetail from './RowDetail'
import { currentRowDetailAtom } from './store'
import type { groupedWordRecords } from './type'
import { isMobileAtom } from '@/store'
import { db, useDeleteWordRecord } from '@/utils/db'
import type { WordRecord } from '@/utils/db/record'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export function ErrorBook() {
  const isMobile = useAtomValue(isMobileAtom)
  const pageSize = useMemo(() => (isMobile ? 9 : 20), [isMobile])

  const [groupedRecords, setGroupedRecords] = useState<groupedWordRecords[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = useMemo(() => Math.ceil(groupedRecords.length / pageSize), [groupedRecords.length])
  const [sortType, setSortType] = useState<ISortType>('asc')
  const navigate = useNavigate()
  const currentRowDetail = useAtomValue(currentRowDetailAtom)
  const { deleteWordRecord } = useDeleteWordRecord()
  const [reload, setReload] = useState(false)

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
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedRecords.slice(start, end)
  }, [currentPage, sortedRecords])

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
          group.records.push(record as WordRecord)
        })

        groups.forEach((group) => {
          group.wrongCount = group.records.reduce((acc, cur) => {
            acc += cur.wrongCount
            return acc
          }, 0)
        })

        setGroupedRecords(groups)
      })
  }, [reload])

  const handleDelete = async (word: string, dict: string) => {
    await deleteWordRecord(word, dict)
    setReload((prev) => !prev)
  }

  return (
    <>
      <div className={`relative flex h-screen w-full flex-col items-center p-4 ease-in sm:p-8 ${currentRowDetail && 'blur-sm'}`}>
        <div className="flex w-auto items-center justify-center self-end">
          <h1 className="font-lighter mr-4 w-auto self-end text-sm/7 text-gray-500 dark:text-gray-400">Tip: 点击错误单词查看详细信息 </h1>
          <IconX className="h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
        </div>

        <div className="flex w-full flex-1 select-text items-start justify-center overflow-hidden">
          <div className="mt-4 flex h-full w-full flex-col">
            <div className="flex w-full justify-between rounded-lg bg-white px-6 py-5 text-lg text-black shadow-lg dark:bg-gray-800 dark:text-white">
              <span className="basis-4/12 text-base sm:basis-2/12">单词</span>
              <span className="basis-4/12 text-base sm:basis-6/12">释义</span>
              <HeadWrongNumber className="basis-2/12 text-base sm:basis-1/12" sortType={sortType} setSortType={setSort} />
              <span className="basis-1/12 text-base sm:basis-1/12">词典</span>
              <span className="basis-1/12 text-base sm:basis-1/12">操作</span>
            </div>
            <ScrollArea.Root className="flex-1 overflow-y-auto pt-5">
              {/* https://github.com/radix-ui/primitives/issues/926#issuecomment-1015279283 */}
              <ScrollArea.Viewport className="h-full [&>div]:!block">
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
        <Pagination className="pb-20 sm:pb-8" page={currentPage} setPage={setPage} totalPages={totalPages} />
      </div>
      {currentRowDetail && <RowDetail currentRowDetail={currentRowDetail} allRecords={sortedRecords} />}
    </>
  )
}
