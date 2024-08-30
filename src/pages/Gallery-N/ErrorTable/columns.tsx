import type { TErrorWordData } from '../hooks/useErrorWords'
import { Button } from '@/components/ui/button'
import { useDeleteWordRecord } from '@/utils/db'
import type { ColumnDef } from '@tanstack/react-table'
import DeleteIcon from '~icons/fa/trash'
import PhArrowsDownUpFill from '~icons/ph/arrows-down-up-fill'

export type ErrorColumn = {
  word: string
  trans: string
  errorCount: number
  errorChar: string[]
  dictId: string
}

export const errorColumns = (deleteWordRecord: (word: string, dictId: string) => Promise<number | undefined>): ColumnDef<ErrorColumn>[] => [
  {
    accessorKey: 'word',
    size: 100,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          单词
          <PhArrowsDownUpFill className="ml-1.5 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'trans',
    size: 500,
    header: '释义',
  },
  {
    accessorKey: 'errorCount',
    size: 40,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          错误次数
          <PhArrowsDownUpFill className="ml-1.5 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="flex justify-center">{row.original.errorCount} </span>
    },
  },
  {
    accessorKey: 'errorChar',
    header: '易错字母',
    size: 100,
    cell: ({ row }) => {
      return (
        <p>
          {(row.getValue('errorChar') as string[]).map((char, index) => (
            <kbd className="flex justify-center" key={`${char}-${index}`}>
              {char + ' '}
            </kbd>
          ))}
        </p>
      )
    },
  },
  {
    accessorKey: 'delete',
    header: '',
    size: 40,
    cell: ({ row }) => {
      return <DeleteIcon className="cursor-pointer" onClick={() => deleteWordRecord(row.original.word, row.original.dictId)} />
    },
  },
]

export function getRowsFromErrorWordData(data: TErrorWordData[], dictId: string): ErrorColumn[] {
  return data.map((item) => {
    return {
      word: item.word,
      trans: item.originData.trans.join('，') ?? '',
      errorCount: item.errorCount,
      errorChar: item.errorChar,
      dictId: dictId,
    }
  })
}
