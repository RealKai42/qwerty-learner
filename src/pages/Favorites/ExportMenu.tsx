import { resolveExportRows, saveExportFile } from '@/utils/export-words'
import type { IFavoriteRecord } from '@/utils/db/record'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type ExportMenuProps = {
  favorites: IFavoriteRecord[]
}

const ExportMenu: FC<ExportMenuProps> = ({ favorites }) => {
  const [isExporting, setIsExporting] = useState(false)
  const { t } = useTranslation()

  const handleExport = async (bookType: 'xlsx' | 'csv') => {
    setIsExporting(true)

    try {
      const rows = await resolveExportRows(favorites.map((item) => ({ word: item.word, dict: item.dict })))

      const colWord = t('favorites.word')
      const colTranslation = t('favorites.translation')
      const colDictionary = t('favorites.dictionary')

      const exportData: Array<Record<string, string | number>> = rows.map((row) => ({
        [colWord]: row.word,
        [colTranslation]: row.translation,
        [colDictionary]: row.dictName,
      }))

      await saveExportFile(exportData, 'Favorites', bookType)
    } catch (error) {
      console.error('Export failed:', error)
      alert(t('favorites.exportFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="z-10 shrink-0">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="my-btn-primary h-8 shadow transition hover:bg-indigo-600 disabled:opacity-50" disabled={isExporting}>
            {isExporting ? t('favorites.exporting') : t('favorites.export')}
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

export default ExportMenu
