import styles from './index.module.css'
import {
  fontSizeConfigAtom,
  foreignFontConfigAtom,
  hintSoundsConfigAtom,
  keySoundsConfigAtom,
  translateFontConfigAtom,
  webdavConfigAtom,
  webdavConfigReadyAtom,
} from '@/store'
import { db } from '@/utils/db'
import {
  applyBackupSettings,
  deleteWebDAVBackup,
  fullBackupToWebDAV,
  getBackupInfo,
  mergeBackupIntoLocal,
  listWebDAVBackups,
  restoreFromWebDAV,
  testWebDAVConnection,
  withBackupLock,
} from '@/utils/webdav'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconCloud from '~icons/tabler/cloud'
import IconCloudDownload from '~icons/tabler/cloud-download'
import IconCloudUpload from '~icons/tabler/cloud-upload'
import IconTrash from '~icons/tabler/trash'

interface BackupFile {
  name: string
  url: string
  date: string
  size: number
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function WebDAVSetting() {
  const { t } = useTranslation()
  const [savedWebdavConfig, persistWebdavConfig] = useAtom(webdavConfigAtom)
  const configReady = useAtomValue(webdavConfigReadyAtom)
  const [webdavConfig, setWebdavConfig] = useState(savedWebdavConfig)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [configResult, setConfigResult] = useState<{ success: boolean; message: string } | null>(null)
  const setFontSizeConfig = useAtom(fontSizeConfigAtom)[1]
  const setKeySoundsConfig = useAtom(keySoundsConfigAtom)[1]
  const setHintSoundsConfig = useAtom(hintSoundsConfigAtom)[1]
  const setForeignFontConfig = useAtom(foreignFontConfigAtom)[1]
  const setTranslateFontConfig = useAtom(translateFontConfigAtom)[1]
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [backupResult, setBackupResult] = useState<{ success: boolean; message: string } | null>(null)
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null)
  const [backupInfo, setBackupInfo] = useState<{ backupTime: string; recordCount: number; hasSettings: boolean } | null>(null)
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([])
  const [showBackupList, setShowBackupList] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isDirty) setWebdavConfig(savedWebdavConfig)
  }, [savedWebdavConfig, isDirty])

  const handleConfigChange = useCallback(
    (field: keyof typeof webdavConfig, value: string | boolean) => {
      setWebdavConfig((prev) => ({ ...prev, [field]: value }))
      setIsDirty(true)
      setConfigResult(null)
    },
    [setWebdavConfig],
  )

  const handleSaveConfig = useCallback(async () => {
    setIsSaving(true)
    setConfigResult(null)
    try {
      await persistWebdavConfig(webdavConfig)
      setIsDirty(false)
      setConfigResult({ success: true, message: t('settings.webdav.saveConfigSuccess') })
    } catch {
      setConfigResult({ success: false, message: t('settings.webdav.saveConfigFailed') })
    } finally {
      setIsSaving(false)
    }
  }, [persistWebdavConfig, webdavConfig, t])

  const loadBackupInfo = useCallback(async () => {
    if (!savedWebdavConfig.enabled || !savedWebdavConfig.url) return
    const result = await getBackupInfo(savedWebdavConfig)
    if (result.success && result.info) {
      setBackupInfo(result.info)
    } else {
      setBackupInfo(null)
    }
  }, [savedWebdavConfig])

  useEffect(() => {
    loadBackupInfo()
  }, [loadBackupInfo])

  const handleTestConnection = useCallback(async () => {
    setIsLoading(true)
    setTestResult(null)
    try {
      const result = await testWebDAVConnection(webdavConfig)
      setTestResult(result)
    } catch (e) {
      setTestResult({ success: false, message: e instanceof Error ? e.message : t('settings.webdav.connectionTestFailed') })
    }
    setIsLoading(false)
  }, [webdavConfig])

  const handleBackup = useCallback(async () => {
    setIsLoading(true)
    setBackupResult(null)
    try {
      const wordRecords = await db.wordRecords.toArray()
      const chapterRecords = await db.chapterRecords.toArray()
      const reviewRecords = await db.reviewRecords.toArray()
      const favoriteRecords = await db.favoriteRecords.toArray()
      const result = await fullBackupToWebDAV({ wordRecords, chapterRecords, reviewRecords, favoriteRecords }, webdavConfig)
      setBackupResult(result)
      if (result.success) {
        await loadBackupInfo()
      }
    } catch (e) {
      setBackupResult({ success: false, message: e instanceof Error ? e.message : t('settings.webdav.backupFailed') })
    }
    setIsLoading(false)
  }, [webdavConfig, loadBackupInfo])

  const handleListBackups = useCallback(async () => {
    setIsLoading(true)
    setShowBackupList(false)
    try {
      const result = await listWebDAVBackups(webdavConfig)
      if (result.success) {
        setBackupFiles(result.files)
        setShowBackupList(true)
      } else {
        setRestoreResult({ success: false, message: result.message })
      }
    } catch (e) {
      setRestoreResult({ success: false, message: e instanceof Error ? e.message : t('settings.webdav.listBackupsFailed') })
    }
    setIsLoading(false)
  }, [webdavConfig])

  const handleRestore = useCallback(
    async (fileUrl: string) => {
      setIsLoading(true)
      setRestoreResult(null)
      try {
        await withBackupLock(async () => {
          const result = await restoreFromWebDAV(webdavConfig, fileUrl)
          if (!result.success || !result.data) {
            setRestoreResult(result)
            return
          }

          const remoteData = result.data
          const remoteNewCount = await mergeBackupIntoLocal(remoteData)

          // Apply settings from backup if present
          if (remoteData.settings) {
            applyBackupSettings(remoteData.settings)
            const s = remoteData.settings
            // Update in-memory atoms so the UI reflects changes immediately
            if (s.fontSizeConfig) setFontSizeConfig(s.fontSizeConfig)
            if (s.keySoundsConfig) setKeySoundsConfig(s.keySoundsConfig as any)
            if (s.hintSoundsConfig) setHintSoundsConfig(s.hintSoundsConfig as any)
            if (s.foreignFontConfig) setForeignFontConfig(s.foreignFontConfig as any)
            if (s.translateFontConfig) setTranslateFontConfig(s.translateFontConfig as any)
          }

          const hasSettings = !!remoteData.settings
          const settingsMsg = hasSettings ? t('settings.webdav.withSettings') : ''
          setRestoreResult({
            success: true,
            message:
              remoteNewCount > 0
                ? `${t('settings.webdav.restoreSuccessNew', { count: remoteNewCount })}${settingsMsg}`
                : `${t('settings.webdav.restoreSuccessUpToDate')}${settingsMsg}`,
          })
        })
      } catch (e) {
        setRestoreResult({ success: false, message: e instanceof Error ? e.message : t('settings.webdav.restoreFailed') })
      }
      setIsLoading(false)
    },
    [webdavConfig],
  )

  const handleDeleteBackup = useCallback(
    async (fileUrl: string) => {
      if (!confirm(t('settings.webdav.confirmDeleteBackup'))) return
      setIsLoading(true)
      try {
        const result = await deleteWebDAVBackup(webdavConfig, fileUrl)
        if (result.success) {
          setBackupFiles((prev) => prev.filter((f) => f.url !== fileUrl))
        }
        setRestoreResult(result)
      } catch (e) {
        setRestoreResult({ success: false, message: e instanceof Error ? e.message : t('settings.webdav.deleteFailed') })
      }
      setIsLoading(false)
    },
    [webdavConfig],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.webdav.backupConfig')}</span>
            <span className={styles.sectionDescription}>{t('settings.webdav.backupConfigDesc')}</span>

            <div className="flex flex-col gap-3 px-4">
              {!configReady && (
                <p role="status" className="text-sm text-gray-500">
                  {t('settings.webdav.loadingConfig')}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-700 dark:text-gray-300">{t('settings.webdav.enableBackup')}</span>
                <button
                  type="button"
                  disabled={!configReady || isSaving}
                  onClick={() => handleConfigChange('enabled', !webdavConfig.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webdavConfig.enabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webdavConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.webdav.webdavUrl')}</span>
                <input
                  type="text"
                  disabled={!configReady || isSaving}
                  value={webdavConfig.url}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://nas.local/webdav/"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.webdav.username')}</span>
                <input
                  type="text"
                  disabled={!configReady || isSaving}
                  value={webdavConfig.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.webdav.password')}</span>
                <input
                  type="password"
                  disabled={!configReady || isSaving}
                  value={webdavConfig.password}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-700 dark:text-gray-300">{t('settings.webdav.autoBackup')}</span>
                <button
                  type="button"
                  disabled={!configReady || isSaving}
                  onClick={() => handleConfigChange('autoBackup', !webdavConfig.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webdavConfig.autoBackup ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webdavConfig.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-300">{t('settings.webdav.autoBackupDesc')}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={!configReady || !isDirty || isSaving || isLoading}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <IconCheck className="h-4 w-4" />
                  {t(isSaving ? 'settings.webdav.savingConfig' : 'settings.webdav.saveConfig')}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <IconCheck fontSize={14} />
                  {t('settings.webdav.testConnection')}
                </button>
                <button
                  type="button"
                  onClick={handleBackup}
                  disabled={isLoading || isDirty || isSaving || !savedWebdavConfig.enabled}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <IconCloudUpload fontSize={14} />
                  {t('settings.webdav.fullBackup')}
                </button>
                <button
                  type="button"
                  onClick={handleListBackups}
                  disabled={isLoading || isDirty || isSaving || !savedWebdavConfig.enabled}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <IconCloud fontSize={14} />
                  {t('settings.webdav.listBackups')}
                </button>
              </div>

              {configResult && (
                <p role="status" className={`text-sm ${configResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {configResult.message}
                </p>
              )}

              {testResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    testResult.success
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              {backupResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    backupResult.success
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {backupResult.message}
                </div>
              )}

              {restoreResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    restoreResult.success
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {restoreResult.message}
                </div>
              )}

              {backupInfo && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {t('settings.webdav.lastBackupInfo', {
                      time: new Date(backupInfo.backupTime).toLocaleString(),
                      count: backupInfo.recordCount,
                    })}
                    {backupInfo.hasSettings ? t('settings.webdav.withSettings') : ''}
                  </span>
                </div>
              )}

              {showBackupList && (
                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.webdav.selectBackupToRestore')}</span>
                    <button
                      type="button"
                      onClick={() => setShowBackupList(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      {t('settings.webdav.close')}
                    </button>
                  </div>
                  {backupFiles.length === 0 ? (
                    <span className="text-sm text-gray-500 dark:text-gray-300">{t('settings.webdav.noBackupFiles')}</span>
                  ) : (
                    <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
                      {backupFiles.map((file) => (
                        <div key={file.url} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
                          <div className="flex flex-col">
                            <span className="max-w-[200px] truncate text-xs font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-300">
                              <span>{file.date}</span>
                              <span>{formatSize(file.size)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRestore(file.url)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                            >
                              <IconCloudDownload fontSize={12} />
                              {t('settings.webdav.restore')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBackup(file.url)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                            >
                              <IconTrash fontSize={12} />
                              {t('settings.webdav.delete')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent" orientation="vertical" />
    </ScrollArea.Root>
  )
}
