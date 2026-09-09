import styles from './index.module.css'
import { webdavConfigAtom } from '@/store'
import { deleteWebDAVBackup, fullBackupToWebDAV, getBackupInfo, listWebDAVBackups, restoreFromWebDAV, testWebDAVConnection } from '@/utils/webdav'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import IconCheck from '~icons/tabler/check'
import IconCloud from '~icons/tabler/cloud'
import IconCloudDownload from '~icons/tabler/cloud-download'
import IconCloudUpload from '~icons/tabler/cloud-upload'
import IconRefresh from '~icons/tabler/refresh'
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
  const [webdavConfig, setWebdavConfig] = useAtom(webdavConfigAtom)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [backupResult, setBackupResult] = useState<{ success: boolean; message: string } | null>(null)
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null)
  const [backupInfo, setBackupInfo] = useState<{ backupTime: string; recordCount: number } | null>(null)
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([])
  const [showBackupList, setShowBackupList] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfigChange = useCallback(
    (field: keyof typeof webdavConfig, value: string | boolean) => {
      setWebdavConfig((prev) => ({ ...prev, [field]: value }))
    },
    [setWebdavConfig],
  )

  const loadBackupInfo = useCallback(async () => {
    if (!webdavConfig.enabled || !webdavConfig.url) return
    const result = await getBackupInfo(webdavConfig)
    if (result.success && result.info) {
      setBackupInfo(result.info)
    } else {
      setBackupInfo(null)
    }
  }, [webdavConfig])

  useEffect(() => {
    loadBackupInfo()
  }, [loadBackupInfo])

  const handleTestConnection = useCallback(async () => {
    setIsLoading(true)
    setTestResult(null)
    const result = await testWebDAVConnection(webdavConfig)
    setTestResult(result)
    setIsLoading(false)
  }, [webdavConfig])

  const handleBackup = useCallback(async () => {
    setIsLoading(true)
    setBackupResult(null)
    const { db } = await import('@/utils/db')
    const wordRecords = await db.wordRecords.toArray()
    const chapterRecords = await db.chapterRecords.toArray()
    const reviewRecords = await db.reviewRecords.toArray()
    const result = await fullBackupToWebDAV({ wordRecords, chapterRecords, reviewRecords }, webdavConfig)
    setBackupResult(result)
    if (result.success) {
      await loadBackupInfo()
    }
    setIsLoading(false)
  }, [webdavConfig, loadBackupInfo])

  const handleListBackups = useCallback(async () => {
    setIsLoading(true)
    setShowBackupList(false)
    const result = await listWebDAVBackups(webdavConfig)
    if (result.success) {
      setBackupFiles(result.files)
      setShowBackupList(true)
    } else {
      setRestoreResult({ success: false, message: result.message })
    }
    setIsLoading(false)
  }, [webdavConfig])

  const handleRestore = useCallback(async (fileUrl: string) => {
    setIsLoading(true)
    setRestoreResult(null)
    const result = await restoreFromWebDAV(webdavConfig, fileUrl)
    if (result.success && result.data) {
      const { db } = await import('@/utils/db')
      const data = result.data
      await db.wordRecords.clear()
      await db.chapterRecords.clear()
      await db.reviewRecords.clear()
      if (data.wordRecords?.length) await db.wordRecords.bulkAdd(data.wordRecords as never[])
      if (data.chapterRecords?.length) await db.chapterRecords.bulkAdd(data.chapterRecords as never[])
      if (data.reviewRecords?.length) await db.reviewRecords.bulkAdd(data.reviewRecords as never[])
      setRestoreResult({ success: true, message: '恢复成功，请刷新页面' })
    } else {
      setRestoreResult(result)
    }
    setIsLoading(false)
  }, [webdavConfig])

  const handleDeleteBackup = useCallback(async (fileUrl: string) => {
    if (!confirm('确定要删除这个备份文件吗？')) return
    setIsLoading(true)
    const result = await deleteWebDAVBackup(webdavConfig, fileUrl)
    if (result.success) {
      setBackupFiles((prev) => prev.filter((f) => f.url !== fileUrl))
    }
    setRestoreResult(result)
    setIsLoading(false)
  }, [webdavConfig])

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>WebDAV 配置</span>
            <span className={styles.sectionDescription}>
              配置 NAS 的 WebDAV 地址，每次完成章节后自动增量备份打字数据到 NAS。
              手动备份会创建新的完整备份文件。
            </span>

            <div className="flex flex-col gap-3 px-4">
              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-700 dark:text-gray-300">启用备份</span>
                <button
                  type="button"
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
                <span className="text-sm text-gray-700 dark:text-gray-300">WebDAV 地址</span>
                <input
                  type="text"
                  value={webdavConfig.url}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://nas.local/webdav/"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">用户名</span>
                <input
                  type="text"
                  value={webdavConfig.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">密码</span>
                <input
                  type="password"
                  value={webdavConfig.password}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-20 text-sm text-gray-700 dark:text-gray-300">自动备份</span>
                <button
                  type="button"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">章节完成后自动增量备份</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300"
                >
                  <IconCheck fontSize={14} />
                  测试连接
                </button>
                <button
                  type="button"
                  onClick={handleBackup}
                  disabled={isLoading || !webdavConfig.enabled}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300"
                >
                  <IconCloudUpload fontSize={14} />
                  完整备份
                </button>
                <button
                  type="button"
                  onClick={handleListBackups}
                  disabled={isLoading || !webdavConfig.enabled}
                  className="my-btn-primary flex items-center gap-1 text-sm disabled:bg-gray-300"
                >
                  <IconCloud fontSize={14} />
                  列出备份
                </button>
              </div>

              {testResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              {backupResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    backupResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {backupResult.message}
                </div>
              )}

              {restoreResult && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    restoreResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {restoreResult.message}
                </div>
              )}

              {backupInfo && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    上次备份: {new Date(backupInfo.backupTime).toLocaleString()}，共 {backupInfo.recordCount} 条记录
                  </span>
                </div>
              )}

              {showBackupList && (
                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">选择备份文件恢复</span>
                    <button
                      type="button"
                      onClick={() => setShowBackupList(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      关闭
                    </button>
                  </div>
                  {backupFiles.length === 0 ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">暂无备份文件</span>
                  ) : (
                    <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
                      {backupFiles.map((file) => (
                        <div
                          key={file.url}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                        >
                          <div className="flex flex-col">
                            <span className="max-w-[200px] truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                              {file.name}
                            </span>
                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{file.date}</span>
                              <span>{formatSize(file.size)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRestore(file.url)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-600 disabled:bg-gray-300"
                            >
                              <IconCloudDownload fontSize={12} />
                              恢复
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBackup(file.url)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:bg-gray-300"
                            >
                              <IconTrash fontSize={12} />
                              删除
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
