import type { GistSyncConfig } from '@/store/gistSyncAtom'
import { gistSyncConfigAtom } from '@/store/gistSyncAtom'
import { createGist, deserializeSyncPayload, fetchGist, fetchGistRemoteInfo, serializeSyncPayload, updateGist } from '@/utils/gistSync'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'

// ──────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict'

export type ConflictInfo = {
  localSyncAt: number
  localDictId: string
  localChapter: number
  remoteSyncAt: number
  remoteDictId: string
  remoteChapter: number
}

export type UseGistSyncReturn = {
  config: GistSyncConfig
  updateConfig: (partial: Partial<GistSyncConfig>) => void
  status: SyncStatus
  progress: number
  errorMsg: string
  conflictInfo: ConflictInfo | null
  /** 上传本地数据到 Gist（覆盖云端） */
  upload: () => Promise<void>
  /** 从 Gist 下载数据并覆盖本地 */
  download: () => Promise<void>
  /**
   * 智能同步：比较本地与云端时间戳
   * - 若云端比本地新 → 触发冲突弹窗（设置 status='conflict'）
   * - 否则 → 直接上传
   */
  smartSync: () => Promise<void>
  /** 用户在冲突弹窗中选择"使用本地"后调用 */
  resolveConflictWithLocal: () => Promise<void>
  /** 用户在冲突弹窗中选择"使用云端"后调用 */
  resolveConflictWithRemote: () => Promise<void>
  /** 重置 status 到 idle */
  resetStatus: () => void
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useGistSync(): UseGistSyncReturn {
  const [config, setConfig] = useAtom(gistSyncConfigAtom)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null)

  const updateConfig = useCallback(
    (partial: Partial<GistSyncConfig>) => {
      setConfig((prev) => ({ ...prev, ...partial }))
    },
    [setConfig],
  )

  const resetStatus = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    setConflictInfo(null)
  }, [])

  // ── 上传 ──────────────────────────────────────

  const upload = useCallback(async () => {
    const { token, gistId } = config
    if (!token) {
      setErrorMsg('请先填写 GitHub Personal Access Token')
      setStatus('error')
      return
    }

    setStatus('syncing')
    setProgress(0)
    setErrorMsg('')

    try {
      const payload = await serializeSyncPayload((pct) => setProgress(Math.floor(pct * 0.8)))

      let currentGistId = gistId
      if (!currentGistId) {
        currentGistId = await createGist(token, payload)
        updateConfig({
          gistId: currentGistId,
          lastSyncAt: payload.meta.syncAt,
          lastSyncDictId: payload.meta.dictId,
          lastSyncChapter: payload.meta.chapter,
        })
      } else {
        await updateGist(token, currentGistId, payload)
        updateConfig({ lastSyncAt: payload.meta.syncAt, lastSyncDictId: payload.meta.dictId, lastSyncChapter: payload.meta.chapter })
      }

      setProgress(100)
      setStatus('success')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '上传失败，请检查 Token 和网络连接')
      setStatus('error')
    }
  }, [config, updateConfig])

  // ── 下载 ──────────────────────────────────────

  const download = useCallback(async () => {
    const { token, gistId } = config
    if (!token || !gistId) {
      setErrorMsg('请先填写 Token 和 Gist ID')
      setStatus('error')
      return
    }

    setStatus('syncing')
    setProgress(0)
    setErrorMsg('')

    try {
      const payload = await fetchGist(token, gistId)
      await deserializeSyncPayload(payload, (pct) => setProgress(Math.floor(pct * 0.9)))
      updateConfig({
        lastSyncAt: payload.meta.syncAt,
        lastSyncDictId: payload.meta.dictId ?? '',
        lastSyncChapter: payload.meta.chapter ?? 0,
      })
      setProgress(100)
      setStatus('success')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '下载失败，请检查 Token / Gist ID 和网络连接')
      setStatus('error')
    }
  }, [config, updateConfig])

  // ── 智能同步 ──────────────────────────────────

  const smartSync = useCallback(async () => {
    const { token, gistId, lastSyncAt } = config
    if (!token) {
      setErrorMsg('请先填写 GitHub Personal Access Token')
      setStatus('error')
      return
    }

    // 若没有 gistId，直接上传创建
    if (!gistId) {
      await upload()
      return
    }

    setStatus('syncing')
    setProgress(10)
    setErrorMsg('')

    try {
      const remoteInfo = await fetchGistRemoteInfo(token, gistId)
      setProgress(30)

      if (remoteInfo.syncAt > lastSyncAt) {
        // 云端比本地新 → 冲突
        setConflictInfo({
          localSyncAt: lastSyncAt,
          localDictId: config.lastSyncDictId,
          localChapter: config.lastSyncChapter,
          remoteSyncAt: remoteInfo.syncAt,
          remoteDictId: remoteInfo.dictId,
          remoteChapter: remoteInfo.chapter,
        })
        setStatus('conflict')
      } else {
        // 本地更新或相同 → 上传
        setStatus('idle') // 重置，让 upload 接管状态
        await upload()
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '同步检查失败')
      setStatus('error')
    }
  }, [config, upload])

  // ── 冲突解决 ──────────────────────────────────

  const resolveConflictWithLocal = useCallback(async () => {
    setConflictInfo(null)
    await upload()
  }, [upload])

  const resolveConflictWithRemote = useCallback(async () => {
    setConflictInfo(null)
    await download()
  }, [download])

  return {
    config,
    updateConfig,
    status,
    progress,
    errorMsg,
    conflictInfo,
    upload,
    download,
    smartSync,
    resolveConflictWithLocal,
    resolveConflictWithRemote,
    resetStatus,
  }
}

// ──────────────────────────────────────────────
// 自动同步 Hook（章节完成后调用，静默失败）
// ──────────────────────────────────────────────

/**
 * 在章节完成时自动上传本地数据到 Gist。
 * 用法：在 Typing/index.tsx 中调用 `useAutoGistSync(state.isFinished)`
 */
export function useAutoGistSync(isFinished: boolean) {
  const [config, setConfig] = useAtom(gistSyncConfigAtom)
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (!isFinished) {
      triggeredRef.current = false
      return
    }
    // 每次章节完成只触发一次
    if (triggeredRef.current) return
    triggeredRef.current = true

    if (!config.autoSync || !config.token) return

    void (async () => {
      try {
        const payload = await serializeSyncPayload()
        let gistId = config.gistId
        if (!gistId) {
          gistId = await createGist(config.token, payload)
          setConfig((prev) => ({
            ...prev,
            gistId,
            lastSyncAt: payload.meta.syncAt,
            lastSyncDictId: payload.meta.dictId,
            lastSyncChapter: payload.meta.chapter,
          }))
        } else {
          await updateGist(config.token, gistId, payload)
          setConfig((prev) => ({
            ...prev,
            lastSyncAt: payload.meta.syncAt,
            lastSyncDictId: payload.meta.dictId,
            lastSyncChapter: payload.meta.chapter,
          }))
        }
      } catch {
        // 自动同步静默失败，不影响主流程
      }
    })()
  }, [isFinished, config, setConfig])
}
