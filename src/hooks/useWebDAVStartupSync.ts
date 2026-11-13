import { currentChapterAtom, currentDictIdAtom, webdavConfigAtom } from '@/store'
import { idDictionaryMap } from '@/resources/dictionary'
import { db } from '@/utils/db'
import { startupSyncToWebDAV } from '@/utils/webdav'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

export interface SyncNotice {
  dictId: string
  dictName: string
  latestChapter: number
  currentChapter: number
  syncedCount: number
}

export function useWebDAVStartupSync(onSyncNotice?: (notice: SyncNotice) => void) {
  const webdavConfig = useAtomValue(webdavConfigAtom)
  const currentDictId = useAtomValue(currentDictIdAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const lastConfigRef = useRef('')
  const syncingRef = useRef(false)
  const onSyncNoticeRef = useRef(onSyncNotice)
  onSyncNoticeRef.current = onSyncNotice

  useEffect(() => {
    const configKey = JSON.stringify(webdavConfig)
    if (configKey === lastConfigRef.current) return

    const shouldSync = webdavConfig.enabled && webdavConfig.autoBackup && webdavConfig.url
    if (!shouldSync) return

    if (syncingRef.current) return

    ;(async () => {
      syncingRef.current = true
      try {
        // Record the latest local timeStamp before sync so we can identify newly synced records
        const localLatest = await db.chapterRecords.orderBy('timeStamp').reverse().first()
        const localLatestTimeStamp = localLatest?.timeStamp ?? 0

        const result = await startupSyncToWebDAV(webdavConfig)

        if (result.success) {
          console.info('[WebDAV] Startup sync complete:', result.message)
          lastConfigRef.current = configKey

          if (result.settingsApplied) {
            location.reload()
            return
          }
          if (result.syncedCount && result.syncedCount > 0) {
            const latestInfo = await findLatestChapterFromSync(currentDictId, currentChapter, result.syncedCount, localLatestTimeStamp)
            if (latestInfo && onSyncNoticeRef.current) {
              onSyncNoticeRef.current(latestInfo)
            }
          }
        } else {
          console.warn('[WebDAV] Startup sync failed:', result.message)
        }
      } catch (e) {
        console.warn('[WebDAV] Startup sync error:', e)
      } finally {
        syncingRef.current = false
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webdavConfig])

  const jumpToLatestChapter = useCallback(
    (dictId: string, chapter: number) => {
      setCurrentDictId(dictId)
      setCurrentChapter(chapter)
    },
    [setCurrentDictId, setCurrentChapter],
  )

  return { jumpToLatestChapter }
}

/**
 * Find the latest chapter among records that were just synced from remote.
 * We identify synced records by querying chapterRecords whose timeStamp is
 * greater than the localLatestTimeStamp (captured before sync ran).
 */
async function findLatestChapterFromSync(
  currentDictId: string,
  currentChapter: number,
  syncedCount: number,
  localLatestTimeStamp: number,
): Promise<SyncNotice | null> {
  // Query records that are newer than what we had before sync
  const syncedRecords = await db.chapterRecords
    .where('timeStamp')
    .above(localLatestTimeStamp)
    .sortBy('timeStamp')

  if (syncedRecords.length === 0) return null

  // Find the most recent valid chapter record among synced records
  const latestRecord = syncedRecords.filter((r) => r.chapter !== null).pop()
  if (!latestRecord || latestRecord.chapter === null) return null

  const latestDictId = latestRecord.dict
  const latestChapter: number = latestRecord.chapter

  if (latestDictId === currentDictId && latestChapter === currentChapter) return null

  const dict = idDictionaryMap[latestDictId]
  if (!dict) return null

  if (latestChapter < 0 || latestChapter >= dict.chapterCount) return null

  return {
    dictId: latestDictId,
    dictName: dict.name,
    latestChapter,
    currentChapter,
    syncedCount,
  }
}
