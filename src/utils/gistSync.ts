/**
 * GitHub Gist 同步工具
 *
 * 数据格式：
 *   Gist 包含两个文件：
 *   - `qwerty-db.gz.b64`   : Dexie 导出的 JSON 经 gzip 压缩后 base64 编码的字符串（IndexedDB 数据）
 *   - `qwerty-meta.json`   : 用户 localStorage 配置 + 同步元信息
 */
import { db } from './db'

// ──────────────────────────────────────────────
// 常量
// ──────────────────────────────────────────────

const GIST_API = 'https://api.github.com/gists'
const DB_FILE_NAME = 'qwerty-db.gz.b64'
const META_FILE_NAME = 'qwerty-meta.json'
const GIST_DESCRIPTION = 'Qwerty Learner sync data'

/** 需要同步的 localStorage key（从 store/index.ts 收集） */
const CONFIG_KEYS = [
  'currentDict',
  'currentChapter',
  'loopWordConfig',
  'keySoundsConfig',
  'hintSoundsConfig',
  'pronunciation',
  'fontsize',
  'randomConfig',
  'isShowPrevAndNextWord',
  'isIgnoreCase',
  'isShowAnswerOnHover',
  'isTextSelectable',
  'phoneticConfig',
  'isOpenDarkModeAtom',
  'wordDictationConfig',
  'hasSeenEnhancedPromotion',
] as const

// ──────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────

export type SyncMeta = {
  /** 同步时间戳（UTC ms） */
  syncAt: number
  /** 同步时正在练习的词典 ID */
  dictId: string
  /** 同步时正在练习的章节（0-based） */
  chapter: number
  /** 配置项快照 */
  config: Record<string, unknown>
}

export type GistSyncPayload = {
  /** base64 编码的 gzip 数据库内容 */
  dbBase64: string
  meta: SyncMeta
}

export type GistInfo = {
  id: string
  syncAt: number
}

// ──────────────────────────────────────────────
// 序列化 / 反序列化
// ──────────────────────────────────────────────

/** 读取所有需要同步的 localStorage 配置 */
function readLocalConfig(): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of CONFIG_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try {
        result[key] = JSON.parse(raw)
      } catch {
        result[key] = raw
      }
    }
  }
  return result
}

/** 将配置写回 localStorage */
function writeLocalConfig(config: Record<string, unknown>) {
  for (const key of CONFIG_KEYS) {
    if (key in config) {
      const value = config[key]
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // ignore
      }
    }
  }
}

/**
 * 将本地数据打包成可上传到 Gist 的 payload
 * @param onProgress 进度回调（0~100）
 */
export async function serializeSyncPayload(onProgress?: (pct: number) => void): Promise<GistSyncPayload> {
  const [pako] = await Promise.all([import('pako'), import('dexie-export-import')])

  onProgress?.(5)

  const blob = await db.export({
    progressCallback: ({ totalRows, completedRows, done }) => {
      if (totalRows) {
        onProgress?.(5 + Math.floor((completedRows / totalRows) * 60))
      }
      return !done // return false to stop; we want to continue
    },
  })

  onProgress?.(70)

  const json = await blob.text()
  const compressed = pako.gzip(json)

  onProgress?.(85)

  // Uint8Array → base64 string（浏览器环境）
  let binary = ''
  const bytes = new Uint8Array(compressed)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const dbBase64 = btoa(binary)

  onProgress?.(95)

  const config = readLocalConfig()
  const meta: SyncMeta = {
    syncAt: Date.now(),
    dictId: String(config.currentDict ?? 'cet4'),
    chapter: Number(config.currentChapter ?? 0),
    config,
  }

  onProgress?.(100)

  return { dbBase64, meta }
}

/**
 * 将从 Gist 下载的 payload 写入本地
 * @param payload    云端 payload
 * @param onProgress 进度回调（0~100）
 */
export async function deserializeSyncPayload(payload: GistSyncPayload, onProgress?: (pct: number) => void): Promise<void> {
  const [pako] = await Promise.all([import('pako'), import('dexie-export-import')])

  onProgress?.(5)

  // base64 → Uint8Array
  const binary = atob(payload.dbBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  onProgress?.(15)

  const json = pako.ungzip(bytes, { to: 'string' })
  const blob = new Blob([json])

  onProgress?.(25)

  await db.import(blob, {
    acceptVersionDiff: true,
    acceptMissingTables: true,
    acceptNameDiff: false,
    acceptChangedPrimaryKey: false,
    overwriteValues: true,
    clearTablesBeforeImport: true,
    progressCallback: ({ totalRows, completedRows, done }) => {
      if (totalRows) {
        onProgress?.(25 + Math.floor((completedRows / totalRows) * 65))
      }
      return !done
    },
  })

  onProgress?.(95)

  writeLocalConfig(payload.meta.config)

  onProgress?.(100)
}

// ──────────────────────────────────────────────
// Gist API 操作
// ──────────────────────────────────────────────

function buildGistBody(payload: GistSyncPayload) {
  return {
    description: GIST_DESCRIPTION,
    public: false,
    files: {
      [DB_FILE_NAME]: { content: payload.dbBase64 },
      [META_FILE_NAME]: { content: JSON.stringify(payload.meta, null, 2) },
    },
  }
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub API error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

/** 创建新 Gist，返回 gistId */
export async function createGist(token: string, payload: GistSyncPayload): Promise<string> {
  const data = await request<{ id: string }>(GIST_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildGistBody(payload)),
  })
  return data.id
}

/** 更新已有 Gist */
export async function updateGist(token: string, gistId: string, payload: GistSyncPayload): Promise<void> {
  await request(`${GIST_API}/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildGistBody(payload)),
  })
}

/** 拉取 Gist，解析出 payload */
export async function fetchGist(token: string, gistId: string): Promise<GistSyncPayload> {
  const data = await request<{
    files: {
      [key: string]: { content?: string; raw_url?: string; truncated?: boolean } | undefined
    }
  }>(`${GIST_API}/${gistId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })

  const dbFile = data.files[DB_FILE_NAME]
  const metaFile = data.files[META_FILE_NAME]

  let dbBase64 = dbFile?.content
  if (dbFile?.truncated && dbFile.raw_url) {
    const res = await fetch(dbFile.raw_url)
    dbBase64 = await res.text()
  }

  let metaRaw = metaFile?.content
  if (metaFile?.truncated && metaFile.raw_url) {
    const res = await fetch(metaFile.raw_url)
    metaRaw = await res.text()
  }

  if (!dbBase64 || !metaRaw) {
    throw new Error('Gist 文件结构不完整，可能不是 Qwerty Learner 的同步数据。')
  }

  const meta: SyncMeta = JSON.parse(metaRaw)
  return { dbBase64, meta }
}

/** 云端同步快照信息（轻量查询，仅读 meta 文件） */
export type RemoteSyncInfo = {
  syncAt: number
  dictId: string
  chapter: number
}

/** 拉取云端同步元信息（时间戳 + 词典 + 章节），不反序列化数据库 */
export async function fetchGistRemoteInfo(token: string, gistId: string): Promise<RemoteSyncInfo> {
  const payload = await fetchGist(token, gistId)
  return {
    syncAt: payload.meta.syncAt,
    dictId: payload.meta.dictId ?? '',
    chapter: payload.meta.chapter ?? 0,
  }
}
