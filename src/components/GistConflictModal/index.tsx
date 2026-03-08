import type { ConflictInfo } from '@/hooks/useGistSync'
import { idDictionaryMap } from '@/resources/dictionary'
import * as Dialog from '@radix-ui/react-dialog'

type Props = {
  open: boolean
  conflictInfo: ConflictInfo
  onUseLocal: () => void
  onUseRemote: () => void
}

function formatTs(ts: number): string {
  if (!ts) return '从未同步'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds(),
  )}`
}

function formatDictChapter(dictId: string, chapter: number): string {
  if (!dictId) return ''
  const name = idDictionaryMap[dictId]?.name ?? dictId
  return `${name} 第 ${chapter + 1} 章`
}

export default function GistConflictModal({ open, conflictInfo, onUseLocal, onUseRemote }: Props) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[420px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">检测到同步冲突</Dialog.Title>
          <Dialog.Description className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            云端数据比本地数据更新，请选择保留哪份数据。
            <br />
            <span className="font-medium text-red-500">注意：未选中的一方数据将被覆盖，此操作不可撤销。</span>
          </Dialog.Description>

          <div className="mb-5 space-y-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>本地最后同步</span>
                <span className="font-mono">{formatTs(conflictInfo.localSyncAt)}</span>
              </div>
              {conflictInfo.localDictId && (
                <div className="flex justify-end text-gray-400">
                  {formatDictChapter(conflictInfo.localDictId, conflictInfo.localChapter)}
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>云端最后同步</span>
                <span className="font-mono text-indigo-500">{formatTs(conflictInfo.remoteSyncAt)}</span>
              </div>
              {conflictInfo.remoteDictId && (
                <div className="flex justify-end text-indigo-400">
                  {formatDictChapter(conflictInfo.remoteDictId, conflictInfo.remoteChapter)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={onUseLocal}
            >
              使用本地数据
              <span className="block text-xs font-normal text-gray-400">上传覆盖云端</span>
            </button>
            <button
              className="flex-1 rounded-lg bg-indigo-500 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              onClick={onUseRemote}
            >
              使用云端数据
              <span className="block text-xs font-normal text-indigo-200">下载覆盖本地</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
