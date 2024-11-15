import type { ErrorColumn } from './columns'
import { errorColumns } from './columns'
import { LoadingUI } from '@/components/Loading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

interface DataTableProps {
  data: ErrorColumn[]
  isLoading: boolean
  error: unknown
  onDelete: (word: string) => Promise<void>
}

export function ErrorTable({ data, isLoading, error, onDelete }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(() => errorColumns(onDelete), [onDelete])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    autoResetPageIndex: true,
  })

  return (
    <div className="h-full w-full rounded-md border p-1">
      <Table className="h-full w-full" {...{}}>
        <TableHeader className="sticky top-0 bg-white dark:bg-slate-900">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    {...{
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="w-full">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell
                      key={cell.id}
                      {...{
                        style: {
                          width: cell.column.getSize(),
                        },
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-[22rem] text-center">
                {isLoading ? <LoadingUI /> : error ? '好像遇到错误啦！尝试刷新下' : '暂无数据, 快去练习吧！'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
