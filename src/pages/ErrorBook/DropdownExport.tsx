import type { groupedWordRecords } from './type'
import { resolveExportRows, saveExportFile } from '@/utils/export-words'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type DropdownProps = {
  renderRecords: groupedWordRecords[]
}

const DropdownExport: FC<DropdownProps> = ({ renderRecords }) => {
  const [isExporting, setIsExporting] = useState(false)
  const { t } = useTranslation()

  const handleExport = async (bookType: 'xlsx' | 'csv') => {
    setIsExporting(true)

    try {
      const rows = await resolveExportRows(renderRecords.map((item) => ({ word: item.word, dict: item.dict, wrongCount: item.wrongCount })))

      const colWord = t('errorBook.word')
      const colTranslation = t('errorBook.translation')
      const colWrongCount = t('errorBook.wrongCount')
      const colDictionary = t('errorBook.dictionary')

      const ExportData: Array<Record<string, string | number>> = rows.map((row) => ({
        [colWord]: row.word,
        [colTranslation]: row.translation,
        [colWrongCount]: row.wrongCount ?? 0,
        [colDictionary]: row.dictName,
      }))

      await saveExportFile(ExportData, 'ErrorBook', bookType)
    } catch (error) {
      console.error('Export failed:', error)
      alert(t('errorBook.exportFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="z-10">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="my-btn-primary h-8 shadow transition hover:bg-indigo-600 disabled:opacity-50" disabled={isExporting}>
            {isExporting ? t('errorBook.exporting') : t('errorBook.export')}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="mt-1 rounded bg-indigo-500 text-white shadow-lg">
          <DropdownMenu.Item
            className="cursor-pointer rounded px-4 py-2 hover:bg-indigo-400 focus:bg-indigo-600 focus:outline-none"
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
          >
            .xlsx
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer rounded px-4 py-2 hover:bg-indigo-600 focus:bg-indigo-600 focus:outline-none"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            .csv
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default DropdownExport
