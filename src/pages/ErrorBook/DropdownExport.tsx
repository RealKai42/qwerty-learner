import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { saveAs } from 'file-saver'
import type { FC } from 'react'
import * as XLSX from 'xlsx'

type DropdownProps = {
  renderRecords: any
  paraphrases: any
}

const DropdownExport: FC<DropdownProps> = ({ renderRecords, paraphrases }) => {
  const formatTimestamp = (date: any) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`
  }

  const handleExport = (bookType: string) => {
    const ExportData: Array<{ 单词: string; 释义: string; 错误次数: number; 词典: string }> = []

    renderRecords.forEach((item: any) => {
      const word = paraphrases.find((w: any) => w.name === item.word)
      ExportData.push({
        单词: item.word,
        释义: word ? word.trans.join('；') : '',
        错误次数: item.wrongCount,
        词典: item.dict,
      })
    })

    let blob: Blob

    if (bookType === 'txt') {
      const content = ExportData.map((item: any) => `${item.单词}: ${item.释义}`).join('\n')
      blob = new Blob([content], { type: 'text/plain' })
    } else {
      const worksheet = XLSX.utils.json_to_sheet(ExportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const excelBuffer = XLSX.write(workbook, { bookType: bookType as XLSX.BookType, type: 'array' })
      blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    }

    const timestamp = formatTimestamp(new Date())
    const fileName = `ErrorBook_${timestamp}.${bookType}`

    if (blob && fileName) {
      saveAs(blob, fileName)
    }
  }

  return (
    <div className="z-10">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="my-btn-primary h-8 shadow transition hover:bg-indigo-600">导出</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="mt-1 rounded bg-indigo-500 text-white shadow-lg">
          <DropdownMenu.Item
            className="cursor-pointer rounded px-4 py-2 hover:bg-indigo-400 focus:bg-indigo-600 focus:outline-none"
            onClick={() => handleExport('xlsx')}
          >
            .xlsx
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer rounded px-4 py-2 hover:bg-indigo-600 focus:bg-indigo-600 focus:outline-none"
            onClick={() => handleExport('csv')}
          >
            .csv
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default DropdownExport
