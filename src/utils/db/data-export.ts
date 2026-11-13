import { db } from '.'
import { getCurrentDate, recordDataAction } from '..'
import { isBackupInProgress } from '@/utils/webdav'
import { gzip, ungzip } from 'pako'

export type ExportProgress = {
  totalRows?: number
  completedRows: number
  done: boolean
}

export type ImportProgress = {
  totalRows?: number
  completedRows: number
  done: boolean
}

export async function exportDatabase(callback: (exportProgress: ExportProgress) => boolean) {
  const [{ saveAs }, dexieExportImport] = await Promise.all([import('file-saver'), import('dexie-export-import')])

  const blob = await db.export({
    progressCallback: ({ totalRows, completedRows, done }) => {
      return callback({ totalRows, completedRows, done })
    },
  })
  const [wordCount, chapterCount] = await Promise.all([db.wordRecords.count(), db.chapterRecords.count()])

  const compressed = gzip(await blob.arrayBuffer())
  const compressedBlob = new Blob([compressed as BlobPart])
  const currentDate = getCurrentDate()
  saveAs(compressedBlob, `Qwerty-Learner-User-Data-${currentDate}.gz`)
  recordDataAction({ type: 'export', size: compressedBlob.size, wordCount, chapterCount })
}

export async function importDatabase(onStart: () => void, callback: (importProgress: ImportProgress) => boolean) {
  const [dexieExportImport] = await Promise.all([import('dexie-export-import')])

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/gzip'

  let cleanedUp = false
  function cleanup() {
    if (cleanedUp) return
    cleanedUp = true
    input.remove()
  }

  // Cleanup on cancel (user closes the file dialog without selecting)
  input.addEventListener('cancel', cleanup)

  input.addEventListener('change', async () => {
    cleanup()
    const file = input.files?.[0]
    if (!file) return

    onStart()

    if (isBackupInProgress()) {
      callback({ totalRows: 0, completedRows: 0, done: true })
      return
    }

    const compressed = await file.arrayBuffer()
    const json = ungzip(compressed, { toText: true })
    const blob = new Blob([json as BlobPart])

    await db.import(blob, {
      acceptVersionDiff: true,
      acceptMissingTables: true,
      acceptNameDiff: false,
      acceptChangedPrimaryKey: false,
      overwriteValues: true,
      clearTablesBeforeImport: true,
      progressCallback: ({ totalRows, completedRows, done }) => {
        return callback({ totalRows, completedRows, done })
      },
    })

    const [wordCount, chapterCount] = await Promise.all([db.wordRecords.count(), db.chapterRecords.count()])
    recordDataAction({ type: 'import', size: file.size, wordCount, chapterCount })
  })

  input.click()

  // Fallback cleanup: if user never selects a file, remove the input after 5 minutes
  setTimeout(cleanup, 300000)
}
