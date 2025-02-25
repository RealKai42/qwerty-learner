import { LoadingWordUI } from './LoadingWordUI'
import useGetWord from './hooks/useGetWord'
import { currentRowDetailAtom } from './store'
import type { groupedWordRecords } from './type'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { idDictionaryMap } from '@/resources/dictionary'
import { recordErrorBookAction } from '@/utils'
import { useSetAtom } from 'jotai'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import DeleteIcon from '~icons/weui/delete-filled'

type IErrorRowProps = {
  record: groupedWordRecords
  onDelete: () => void
  onWordUpdate: (word: any) => void
}

const ErrorRow: FC<IErrorRowProps> = ({ record, onDelete, onWordUpdate }) => {
  const setCurrentRowDetail = useSetAtom(currentRowDetailAtom)
  const dictInfo = idDictionaryMap[record.dict]
  const { word, isLoading, hasError } = useGetWord(record.word, dictInfo)
  const prevWordRef = useRef<any>()
  const stableWord = useMemo(() => word, [word])

  const onClick = useCallback(() => {
    setCurrentRowDetail(record)
    recordErrorBookAction('detail')
  }, [record, setCurrentRowDetail])

  useEffect(() => {
    if (stableWord && stableWord !== prevWordRef.current) {
      onWordUpdate(stableWord)
      prevWordRef.current = stableWord
    }
  }, [stableWord, onWordUpdate])

  return (
    <li
      className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-6 py-3 text-black opacity-85 shadow-md dark:bg-gray-800 dark:text-white"
      onClick={onClick}
    >
      <span className="basis-4/12 break-normal sm:basis-2/12">{record.word}</span>
      <span className="basis-4/12 overflow-hidden text-ellipsis whitespace-nowrap sm:basis-6/12">
        {word ? word.trans.join('；') : <LoadingWordUI isLoading={isLoading} hasError={hasError} />}
      </span>
      <span className="basis-2/12 break-normal sm:basis-1/12">{record.wrongCount}</span>
      <span className="basis-1/12 overflow-hidden text-ellipsis whitespace-nowrap break-normal sm:basis-1/12">{dictInfo?.name}</span>
      <span
        className="basis-1/12 break-normal sm:basis-1/12"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DeleteIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Records</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    </li>
  )
}

export default ErrorRow
