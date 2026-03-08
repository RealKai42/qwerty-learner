import styles from './index.module.css'
import GistConflictModal from '@/components/GistConflictModal'
import { useGistSync } from '@/hooks/useGistSync'
import { idDictionaryMap } from '@/resources/dictionary'
import type { ExportProgress, ImportProgress } from '@/utils/db/data-export'
import { exportDatabase, importDatabase } from '@/utils/db/data-export'
import { Switch } from '@headlessui/react'
import * as Progress from '@radix-ui/react-progress'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useState } from 'react'

export default function DataSetting() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  const {
    config: gistConfig,
    updateConfig: updateGistConfig,
    status: gistStatus,
    progress: gistProgress,
    errorMsg: gistError,
    conflictInfo,
    download,
    smartSync,
    resolveConflictWithLocal,
    resolveConflictWithRemote,
    resetStatus,
  } = useGistSync()

  const exportProgressCallback = useCallback(({ totalRows, completedRows, done }: ExportProgress) => {
    if (done) {
      setIsExporting(false)
      setExportProgress(100)
      return true
    }
    if (totalRows) {
      setExportProgress(Math.floor((completedRows / totalRows) * 100))
    }

    return true
  }, [])

  const onClickExport = useCallback(() => {
    setExportProgress(0)
    setIsExporting(true)
    exportDatabase(exportProgressCallback)
  }, [exportProgressCallback])

  const importProgressCallback = useCallback(({ totalRows, completedRows, done }: ImportProgress) => {
    if (done) {
      setIsImporting(false)
      setImportProgress(100)
      return true
    }
    if (totalRows) {
      setImportProgress(Math.floor((completedRows / totalRows) * 100))
    }

    return true
  }, [])

  const onStartImport = useCallback(() => {
    setImportProgress(0)
    setIsImporting(true)
  }, [])

  const onClickImport = useCallback(() => {
    importDatabase(onStartImport, importProgressCallback)
  }, [importProgressCallback, onStartImport])

  return (
    <>
      <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
        <ScrollArea.Viewport className="h-full w-full px-3">
          <div className={styles.tabContent}>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>数据导出</span>
              <span className={styles.sectionDescription}>
                目前，用户的练习数据<strong>仅保存在本地</strong>。如果您需要在不同的设备、浏览器或者其他非官方部署上使用 Qwerty Learner，
                您需要手动进行数据同步和保存。为了保留您的练习进度，以及使用近期即将上线的数据分析和智能训练功能，
                我们建议您及时备份您的数据。
              </span>
              <span className="pl-4 text-left text-sm font-bold leading-tight text-red-500">
                为了您的数据安全，请不要修改导出的数据文件。
              </span>
              <div className="flex h-3 w-full items-center justify-start px-5">
                <Progress.Root
                  className="translate-z-0 relative h-2 w-11/12 transform  overflow-hidden rounded-full bg-gray-200"
                  value={exportProgress}
                >
                  <Progress.Indicator
                    className="cubic-bezier(0.65, 0, 0.35, 1) h-full w-full bg-indigo-400 transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${100 - exportProgress}%)` }}
                  />
                </Progress.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${exportProgress}%`}</span>
              </div>

              <button
                className="my-btn-primary ml-4 disabled:bg-gray-300"
                type="button"
                onClick={onClickExport}
                disabled={isExporting}
                title="导出数据"
              >
                导出数据
              </button>
            </div>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>数据导入</span>
              <span className={styles.sectionDescription}>
                请注意，导入数据将<strong className="text-sm font-bold text-red-500"> 完全覆盖 </strong>当前数据。请谨慎操作。
              </span>

              <div className="flex h-3 w-full items-center justify-start px-5">
                <Progress.Root
                  className="translate-z-0 relative h-2 w-11/12 transform  overflow-hidden rounded-full bg-gray-200"
                  value={importProgress}
                >
                  <Progress.Indicator
                    className="cubic-bezier(0.65, 0, 0.35, 1) h-full w-full bg-indigo-400 transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${100 - importProgress}%)` }}
                  />
                </Progress.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${importProgress}%`}</span>
              </div>

              <button
                className="my-btn-primary ml-4 disabled:bg-gray-300"
                type="button"
                onClick={onClickImport}
                disabled={isImporting}
                title="导入数据"
              >
                导入数据
              </button>
            </div>

            {/* ───── Gist 云同步 ───── */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Gist 云同步</span>
              <span className={styles.sectionDescription}>
                使用 GitHub Gist 在多台设备间同步您的练习记录和配置。需要一个拥有{' '}
                <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">gist</code> 权限的{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist&description=Qwerty+Learner+Sync"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 underline hover:text-indigo-600"
                >
                  Personal Access Token
                </a>
                。
                <br />
                <span className="font-medium text-amber-500">⚠ Token 以明文保存在本地 localStorage，请勿在公共设备上使用。</span>
              </span>

              {/* Token 输入 */}
              <div className="flex w-full flex-col gap-2 px-4">
                <label htmlFor="gist-token" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  GitHub Personal Access Token
                </label>
                <input
                  id="gist-token"
                  type="password"
                  value={gistConfig.token}
                  onChange={(e) => {
                    updateGistConfig({ token: e.target.value })
                    resetStatus()
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />

                <label htmlFor="gist-id" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Gist ID <span className="font-normal text-gray-400">（首次同步后自动填入，也可从已有 Gist URL 中复制）</span>
                </label>
                <input
                  id="gist-id"
                  type="text"
                  value={gistConfig.gistId}
                  onChange={(e) => updateGistConfig({ gistId: e.target.value.trim() })}
                  placeholder="留空则首次同步时自动创建"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* 自动同步开关 */}
              <div className={styles.switchBlock}>
                <Switch
                  checked={gistConfig.autoSync}
                  onChange={(checked: boolean) => updateGistConfig({ autoSync: checked })}
                  className="switch-root"
                >
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
                <span className="text-right text-xs font-normal leading-tight text-gray-600">{`完成章节后自动同步已${
                  gistConfig.autoSync ? '开启' : '关闭'
                }`}</span>
              </div>

              {/* 进度条 */}
              <div className="flex h-3 w-full items-center justify-start px-5">
                <Progress.Root
                  className="translate-z-0 relative h-2 w-11/12 transform overflow-hidden rounded-full bg-gray-200"
                  value={gistProgress}
                >
                  <Progress.Indicator
                    className="h-full w-full bg-indigo-400 transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${100 - gistProgress}%)` }}
                  />
                </Progress.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${gistProgress}%`}</span>
              </div>

              {/* 错误 / 成功提示 */}
              {gistStatus === 'error' && <p className="px-4 text-xs text-red-500">{gistError}</p>}
              {gistStatus === 'success' && <p className="px-4 text-xs text-green-500">同步成功！</p>}
              {gistConfig.lastSyncAt > 0 && gistStatus !== 'syncing' && (
                <p className="px-4 text-xs text-gray-400">
                  上次同步：{new Date(gistConfig.lastSyncAt).toLocaleString()}
                  {gistConfig.lastSyncDictId && (
                    <span className="ml-2 text-gray-400">
                      &middot; {idDictionaryMap[gistConfig.lastSyncDictId]?.name ?? gistConfig.lastSyncDictId} 第{' '}
                      {gistConfig.lastSyncChapter + 1} 章
                    </span>
                  )}
                </p>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2 px-4">
                <button
                  className="my-btn-primary disabled:bg-gray-300"
                  type="button"
                  disabled={gistStatus === 'syncing'}
                  onClick={smartSync}
                  title="智能同步（自动比较本地与云端时间戳）"
                >
                  立即同步
                </button>
                <button
                  className="rounded-lg border border-indigo-400 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:hover:bg-gray-700"
                  type="button"
                  disabled={!gistConfig.gistId || gistStatus === 'syncing'}
                  onClick={download}
                  title="从 Gist 下载并覆盖本地数据"
                >
                  从云端恢复
                </button>
              </div>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {conflictInfo && (
        <GistConflictModal
          open={gistStatus === 'conflict'}
          conflictInfo={conflictInfo}
          onUseLocal={resolveConflictWithLocal}
          onUseRemote={resolveConflictWithRemote}
        />
      )}
    </>
  )
}
