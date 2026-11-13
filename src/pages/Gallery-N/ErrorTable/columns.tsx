import type { TErrorWordData } from '../hooks/useErrorWords'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { LegacyColumnDef } from '@tanstack/react-table/legacy'
import type { TFunction } from 'i18next'
import PhArrowsDownUpFill from '~icons/ph/arrows-down-up-fill'
import DeleteIcon from '~icons/weui/delete-filled'

type ErrorColumnDef = LegacyColumnDef<ErrorColumn>

export type ErrorColumn = {
  word: string
  trans: string
  errorCount: number
  errorChar: string[]
}

export const errorColumns = (onDelete: (word: string) => Promise<void>, t: TFunction): ErrorColumnDef[] => [
  {
    accessorKey: 'word',
    size: 100,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {t('errorBook.word')}
          <PhArrowsDownUpFill className="ml-1.5 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'trans',
    size: 500,
    header: t('errorBook.translation'),
  },
  {
    accessorKey: 'errorCount',
    size: 40,
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="p-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {t('errorBook.errorCount')}
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
    header: t('errorBook.errorProneLetters'),
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
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <DeleteIcon className="cursor-pointer" onClick={() => onDelete(row.original.word)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Records</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
]

export function getRowsFromErrorWordData(data: TErrorWordData[]): ErrorColumn[] {
  return data.map((item) => {
    return {
      word: item.word,
      trans: item.originData.trans.join('，') ?? '',
      errorCount: item.errorCount,
      errorChar: item.errorChar,
    }
  })
}
