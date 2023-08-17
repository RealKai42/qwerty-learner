import useGetWord from './hooks/useGetWord'
import type { groupedWordRecords } from './type'
import { LoadingUI } from '@/components/Loading'
import { idDictionaryMap } from '@/resources/dictionary'
import type { FC } from 'react'

type IErrorRowProps = {
  record: groupedWordRecords
}

const ErrorRow: FC<IErrorRowProps> = ({ record }) => {
  const dictInfo = idDictionaryMap[record.dict]
  const { word, isLoading } = useGetWord(record.word, dictInfo)

  return (
    <li className="opacity-85 flex w-full items-center justify-between rounded-lg bg-white px-6 py-3 shadow-md">
      <span className="basis-2/12 break-normal">{record.word}</span>
      <span className="basis-6/12 break-normal">
        {!isLoading && word ? word.trans.join(', ') : <LoadingUI className="h-4 w-4 !border-2" />}
      </span>
      <span className="basis-1/12 break-normal">{record.wrongCount}</span>
      <span className="basis-2/12 break-normal">{dictInfo.name}</span>
    </li>
  )
}

export default ErrorRow
