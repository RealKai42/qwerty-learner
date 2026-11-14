import { getLastWebdavBackupTime, setLastWebdavBackupTime } from './webdavSettings'
import { db } from '@/utils/db'
import { FAVORITES_SWR_KEY } from '@/utils/db/favorites'
import type { IFavoriteRecord, IReviewRecord } from '@/utils/db/record'
import i18n from 'i18next'
import { deflate, inflate } from 'pako'
import { mutate } from 'swr'

export interface WebDAVConfig {
  enabled: boolean
  url: string
  username: string
  password: string
  autoBackup: boolean
}

export interface BackupSettings {
  fontSizeConfig?: { foreignFont: number; translateFont: number }
  keySoundsConfig?: Record<string, unknown>
  hintSoundsConfig?: Record<string, unknown>
  foreignFontConfig?: Record<string, unknown>
  translateFontConfig?: Record<string, unknown>
}

export interface BackupData {
  backupVersion: string
  backupTime: string
  data: {
    wordRecords: unknown[]
    chapterRecords: unknown[]
    reviewRecords: unknown[]
    favoriteRecords: unknown[]
    settings?: BackupSettings
  }
}

const BACKUP_FILENAME = 'qwerty-learner-backup-latest.jsonz'
const FETCH_TIMEOUT_MS = 30000

const BACKUP_SETTINGS_KEYS = ['fontsize', 'keySoundsConfig', 'hintSoundsConfig', 'foreignFontConfig', 'translateFontConfig']

function collectBackupSettings(): BackupSettings {
  const settings: BackupSettings = {}
  for (const key of BACKUP_SETTINGS_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (key === 'fontsize') settings.fontSizeConfig = parsed
        else if (key === 'keySoundsConfig') settings.keySoundsConfig = parsed
        else if (key === 'hintSoundsConfig') settings.hintSoundsConfig = parsed
        else if (key === 'foreignFontConfig') settings.foreignFontConfig = parsed
        else if (key === 'translateFontConfig') settings.translateFontConfig = parsed
      } catch {
        // skip invalid JSON
      }
    }
  }
  return settings
}

export function applyBackupSettings(settings: BackupSettings): void {
  if (settings.fontSizeConfig) localStorage.setItem('fontsize', JSON.stringify(settings.fontSizeConfig))
  if (settings.keySoundsConfig) localStorage.setItem('keySoundsConfig', JSON.stringify(settings.keySoundsConfig))
  if (settings.hintSoundsConfig) localStorage.setItem('hintSoundsConfig', JSON.stringify(settings.hintSoundsConfig))
  if (settings.foreignFontConfig) localStorage.setItem('foreignFontConfig', JSON.stringify(settings.foreignFontConfig))
  if (settings.translateFontConfig) localStorage.setItem('translateFontConfig', JSON.stringify(settings.translateFontConfig))
}

function compress(data: BackupData): string {
  const json = JSON.stringify(data)
  const compressed = deflate(json)
  return uint8ToBase64(compressed)
}

function decompress(text: string): BackupData {
  const bytes = base64ToUint8(text)
  const json = inflate(bytes, { toText: true })
  return JSON.parse(json as string) as BackupData
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCodePoint(bytes[i])
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function parseBackupData(text: string): BackupData {
  try {
    return decompress(text)
  } catch {
    return JSON.parse(text) as BackupData
  }
}

// Global backup lock to prevent concurrent backup/restore/sync operations
// (record saves via db.xxx.add() are safe to run concurrently — they only append)
let backupInProgress = false
export function isBackupInProgress(): boolean {
  return backupInProgress
}
async function withBackupLock<T>(fn: () => Promise<T>): Promise<T> {
  if (backupInProgress) throw new Error(i18n.t('webdav.operationInProgress'))
  backupInProgress = true
  try {
    return await fn()
  } finally {
    backupInProgress = false
  }
}
export { withBackupLock }

// Unicode-safe Base64 encoding (handles non-Latin1 characters in username/password)
function getAuthHeader(config: WebDAVConfig): string {
  const credentials = `${config.username}:${config.password}`
  // Modern replacement for deprecated unescape(encodeURIComponent(...))
  const bytes = new TextEncoder().encode(credentials)
  const binary = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
  const encoded = btoa(binary)
  return 'Basic ' + encoded
}

function getBackupUrl(config: WebDAVConfig, filename?: string): string {
  const name = filename || BACKUP_FILENAME
  return config.url.endsWith('/') ? config.url + name : `${config.url}/${name}`
}

// Immutable practice records are unioned; mutable records need conflict resolution.
function deduplicateRecords(existing: unknown[], incoming: unknown[], tableType: TableType): unknown[] {
  const seen = new Map<string, unknown>()
  for (const r of [...existing, ...incoming]) {
    if (!isValidRecord(r, tableType)) throw new Error(i18n.t('webdav.remoteBackupInvalidNotArray'))
    const key = getRecordNaturalKey(r, tableType)
    const previous = seen.get(key)
    if (!previous) {
      seen.set(key, r)
    } else if (tableType === 'reviewRecords') {
      const a = previous as IReviewRecord
      const b = r as IReviewRecord
      // A session can advance or finish on either device, never go backwards.
      seen.set(key, { ...(b.index > a.index ? b : a), index: Math.max(a.index, b.index), isFinished: a.isFinished || b.isFinished })
    } else if (tableType === 'favoriteRecords') {
      const a = previous as IFavoriteRecord
      const b = r as IFavoriteRecord
      const aTime = a.updatedAt ?? a.timeStamp * 1000
      const bTime = b.updatedAt ?? b.timeStamp * 1000
      if (bTime > aTime || (bTime === aTime && b.deleted)) seen.set(key, b)
    }
  }
  return Array.from(seen.values())
}

export type TableType = 'wordRecords' | 'chapterRecords' | 'reviewRecords' | 'favoriteRecords'

/** Required fields for each record type, used to validate remote backup data before bulkAdd */
const RECORD_REQUIRED_FIELDS: Record<TableType, string[]> = {
  wordRecords: ['word', 'timeStamp', 'dict', 'timing', 'wrongCount', 'mistakes'],
  chapterRecords: [
    'dict',
    'chapter',
    'timeStamp',
    'time',
    'correctCount',
    'wrongCount',
    'wordCount',
    'correctWordIndexes',
    'wordNumber',
    'wordRecordIds',
  ],
  reviewRecords: ['dict', 'index', 'createTime', 'isFinished', 'words'],
  favoriteRecords: ['word', 'dict', 'timeStamp'],
}

function isValidRecord(record: unknown, tableType: TableType): boolean {
  if (!record || typeof record !== 'object') return false
  const r = record as Record<string, unknown>
  return RECORD_REQUIRED_FIELDS[tableType].every((field) => field in r)
}

/** Strip `id` from record and return typed object; returns null if validation fails */
export function validateAndStripId(record: unknown, tableType: TableType): Record<string, unknown> | null {
  if (!isValidRecord(record, tableType)) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = record as { id?: number; [k: string]: unknown }
  return rest
}

export function getRecordNaturalKey(record: unknown, tableType: TableType): string {
  const r = record as Record<string, unknown>
  switch (tableType) {
    case 'wordRecords':
      return `w:${r.word ?? ''}:${r.dict ?? ''}:${r.timeStamp ?? 0}`
    case 'chapterRecords':
      return `c:${r.dict ?? ''}:${r.chapter ?? ''}:${r.timeStamp ?? 0}`
    case 'reviewRecords':
      return `r:${r.dict ?? ''}:${r.createTime ?? 0}`
    case 'favoriteRecords':
      // 收藏唯一键: word + dict, 不含 chapter/timeStamp, 防同词异章重复
      return `f:${r.word ?? ''}:${r.dict ?? ''}`
  }
}

const TABLE_TYPES: TableType[] = ['wordRecords', 'chapterRecords', 'reviewRecords', 'favoriteRecords']

function getBackupRecords(backup: BackupData): BackupData['data'] {
  if (!backup?.data || typeof backup.data !== 'object') throw new Error(i18n.t('webdav.remoteBackupInvalidNoData'))
  const data = { ...backup.data, favoriteRecords: backup.data.favoriteRecords ?? [] }
  if (TABLE_TYPES.some((table) => !Array.isArray(data[table]))) {
    throw new Error(i18n.t('webdav.remoteBackupInvalidNotArray'))
  }
  return data
}

async function readLocalRecords(): Promise<BackupData['data']> {
  return {
    wordRecords: await db.wordRecords.toArray(),
    chapterRecords: await db.chapterRecords.toArray(),
    reviewRecords: await db.reviewRecords.toArray(),
    favoriteRecords: await db.favoriteRecords.toArray(),
  }
}

function mergeBackupRecords(existing: BackupData['data'], incoming: BackupData['data']): BackupData['data'] {
  return {
    wordRecords: deduplicateRecords(existing.wordRecords, incoming.wordRecords, 'wordRecords'),
    chapterRecords: deduplicateRecords(existing.chapterRecords, incoming.chapterRecords, 'chapterRecords'),
    reviewRecords: deduplicateRecords(existing.reviewRecords, incoming.reviewRecords, 'reviewRecords'),
    favoriteRecords: deduplicateRecords(existing.favoriteRecords ?? [], incoming.favoriteRecords ?? [], 'favoriteRecords'),
  }
}

/** Used by startup sync and manual restore; keep local primary keys when updating. */
export async function mergeBackupIntoLocal(data: BackupData['data']): Promise<number> {
  const remoteData = getBackupRecords({ data } as BackupData)
  const changedCount = await db.transaction('rw', [db.wordRecords, db.chapterRecords, db.reviewRecords, db.favoriteRecords], async () => {
    const localData = await readLocalRecords()
    const merged = mergeBackupRecords(localData, remoteData)
    let count = 0
    for (const tableType of TABLE_TYPES) {
      const localByKey = new Map(localData[tableType].map((r) => [getRecordNaturalKey(r, tableType), r as Record<string, unknown>]))
      const changes: Record<string, unknown>[] = []
      for (const record of merged[tableType]) {
        const local = localByKey.get(getRecordNaturalKey(record, tableType))
        const value = validateAndStripId(record, tableType)!
        if (local && JSON.stringify(validateAndStripId(local, tableType)) === JSON.stringify(value)) continue
        changes.push(local ? { ...value, id: local.id } : value)
      }
      if (changes.length) await db.table<Record<string, unknown>, number>(tableType).bulkPut(changes)
      count += changes.length
    }
    return count
  })
  // Startup sync may complete after the favorites hook has populated its cache.
  if (changedCount) void mutate(FAVORITES_SWR_KEY).catch(console.error)
  return changedCount
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId))
}

export async function testWebDAVConnection(config: WebDAVConfig): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithTimeout(config.url, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/xml',
      },
    })

    if (response.ok || response.status === 207) {
      return { success: true, message: i18n.t('webdav.connectionSuccess') }
    }
    return { success: false, message: i18n.t('webdav.connectionFailed', { status: response.status }) }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: i18n.t('webdav.connectionTimeout') }
    }
    return { success: false, message: i18n.t('webdav.connectionFailedError', { error: e instanceof Error ? e.message : String(e) }) }
  }
}

/**
 * 增量备份（自动备份用）：合并新增记录、复习进度和收藏状态
 */
export async function incrementalBackupToWebDAV(
  data: { wordRecords: unknown[]; chapterRecords: unknown[]; reviewRecords: unknown[]; favoriteRecords: unknown[] },
  config: WebDAVConfig,
): Promise<{ success: boolean; message: string }> {
  return withBackupLock(async () => {
    const backupStartTime = new Date().toISOString()
    try {
      // Compare actual records, rather than a wall-clock watermark. Timestamps are
      // second-resolution and review/favorite records can change after creation.
      const downloadResult = await downloadExistingBackup(config)
      if (!downloadResult.found && downloadResult.reason === 'error') {
        return { success: false, message: downloadResult.message }
      }
      const remoteData = downloadResult.found ? getBackupRecords(downloadResult.data) : null
      const mergedData = remoteData ? mergeBackupRecords(remoteData, data) : mergeBackupRecords(data, data)
      const settings = collectBackupSettings()
      const count = TABLE_TYPES.reduce((total, table) => {
        const existing = new Map((remoteData?.[table] ?? []).map((r) => [getRecordNaturalKey(r, table), validateAndStripId(r, table)]))
        return (
          total +
          mergedData[table].filter(
            (r) => JSON.stringify(existing.get(getRecordNaturalKey(r, table))) !== JSON.stringify(validateAndStripId(r, table)),
          ).length
        )
      }, 0)
      if (remoteData && count === 0 && JSON.stringify(settings) === JSON.stringify(remoteData.settings ?? {})) {
        return { success: true, message: i18n.t('webdav.noNewDataSkip') }
      }

      const backupData: BackupData = {
        backupVersion: '2.0',
        backupTime: new Date().toISOString(),
        data: { ...mergedData, settings },
      }

      const response = await fetchWithTimeout(getBackupUrl(config), {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader(config),
          'Content-Type': 'application/octet-stream',
        },
        body: compress(backupData),
      })

      if (response.ok) {
        await setLastWebdavBackupTime(backupStartTime)
        return { success: true, message: i18n.t('webdav.incrementalBackupSuccess', { count }) }
      }
      return { success: false, message: i18n.t('webdav.backupFailedHttp', { status: response.status }) }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { success: false, message: i18n.t('webdav.backupTimeout') }
      }
      return { success: false, message: i18n.t('webdav.backupFailedError', { error: e instanceof Error ? e.message : String(e) }) }
    }
  })
}

/**
 * 完整备份（手动备份用）：创建新的完整备份文件，同时更新 latest.json
 */
export async function fullBackupToWebDAV(
  data: { wordRecords: unknown[]; chapterRecords: unknown[]; reviewRecords: unknown[]; favoriteRecords: unknown[] },
  config: WebDAVConfig,
): Promise<{ success: boolean; message: string }> {
  return withBackupLock(async () => {
    try {
      const downloadResult = await downloadExistingBackup(config)
      if (!downloadResult.found && downloadResult.reason === 'error') {
        return { success: false, message: downloadResult.message }
      }
      const remoteData = downloadResult.found ? getBackupRecords(downloadResult.data) : null
      const mergedData = remoteData ? mergeBackupRecords(remoteData, data) : mergeBackupRecords(data, data)
      const timestamp = Date.now()
      const filename = `qwerty-learner-backup-${timestamp}.jsonz`
      const backupData: BackupData = {
        backupVersion: '2.0',
        backupTime: new Date().toISOString(),
        data: { ...data, settings: collectBackupSettings() },
      }

      // 创建带时间戳的备份文件
      const response1 = await fetchWithTimeout(getBackupUrl(config, filename), {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader(config),
          'Content-Type': 'application/octet-stream',
        },
        body: compress(backupData),
      })

      if (!response1.ok) {
        return { success: false, message: i18n.t('webdav.backupFailedHttp', { status: response1.status }) }
      }

      // 同时更新 latest.json（供增量备份使用）
      const response2 = await fetchWithTimeout(getBackupUrl(config), {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader(config),
          'Content-Type': 'application/octet-stream',
        },
        body: compress({ ...backupData, data: { ...mergedData, settings: backupData.data.settings } }),
      })

      if (response2.ok) {
        await setLastWebdavBackupTime(backupData.backupTime)
        return { success: true, message: i18n.t('webdav.fullBackupSuccess', { filename }) }
      }
      return { success: true, message: i18n.t('webdav.fullBackupSuccessLatestNotUpdated', { filename }) }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { success: false, message: i18n.t('webdav.backupTimeout') }
      }
      return { success: false, message: i18n.t('webdav.backupFailedError', { error: e instanceof Error ? e.message : String(e) }) }
    }
  })
}

type DownloadResult = { found: true; data: BackupData } | { found: false; reason: 'not_found' | 'error'; message: string }

async function downloadExistingBackup(config: WebDAVConfig): Promise<DownloadResult> {
  try {
    const response = await fetchWithTimeout(getBackupUrl(config), {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (response.status === 404) {
      return { found: false, reason: 'not_found', message: i18n.t('webdav.remoteNoBackup') }
    }
    if (!response.ok) {
      return { found: false, reason: 'error', message: i18n.t('webdav.downloadExistingFailed', { status: response.status }) }
    }

    const json = await response.text()
    const data = parseBackupData(json)
    return { found: true, data }
  } catch (e) {
    return {
      found: false,
      reason: 'error',
      message: i18n.t('webdav.downloadExistingError', { error: e instanceof Error ? e.message : String(e) }),
    }
  }
}

export async function listWebDAVBackups(
  config: WebDAVConfig,
): Promise<{ success: boolean; files: { name: string; url: string; date: string; size: number }[]; message: string }> {
  try {
    const response = await fetchWithTimeout(config.url, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/xml',
        Depth: '1',
      },
    })

    if (!response.ok && response.status !== 207) {
      return { success: false, files: [], message: i18n.t('webdav.listFilesFailed', { status: response.status }) }
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, 'text/xml')

    // Parse WebDAV response for all files
    const responses = xmlDoc.querySelectorAll('response, d\\:response, D\\:response')
    const files: { name: string; url: string; date: string; size: number }[] = []
    const baseUrl = config.url.endsWith('/') ? config.url : config.url + '/'

    responses.forEach((resp) => {
      const hrefEl = resp.querySelector('href, d\\:href, D\\:href')
      const propstat = resp.querySelector('propstat, d\\:propstat, D\\:propstat')
      if (!hrefEl || !propstat) return

      const status = propstat.querySelector('status, d\\:status, D\\:status')
      if (status && status.textContent?.includes('404')) return

      const url = hrefEl.textContent || ''
      // Match both compressed (.jsonz) and legacy (.json) backup files
      if (!url.match(/qwerty-learner-backup-(\d+|latest)\.jsonz?/)) return

      // Extract timestamp from filename
      const match = url.match(/qwerty-learner-backup-(\d+)\.jsonz?/)
      const isLatest = url.includes('backup-latest.jsonz')
      const timestamp = match ? parseInt(match[1]) : 0
      const date = isLatest ? i18n.t('webdav.latestLabel') : new Date(timestamp).toLocaleString()

      // Extract file size
      const sizeEl = resp.querySelector('getcontentlength, d\\:getcontentlength, D\\:getcontentlength')
      const size = sizeEl ? parseInt(sizeEl.textContent || '0') : 0

      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href
      files.push({ name: url.split('/').pop() || url, url: fullUrl, date, size })
    })

    // Sort: latest.json first, then by timestamp descending
    files.sort((a, b) => {
      if (a.name.includes('latest.jsonz')) return -1
      if (b.name.includes('latest.jsonz')) return 1
      const aTime = a.name.match(/-(\d+)\.jsonz?/)?.[1] || '0'
      const bTime = b.name.match(/-(\d+)\.jsonz?/)?.[1] || '0'
      return parseInt(bTime) - parseInt(aTime)
    })

    return { success: true, files, message: i18n.t('webdav.foundBackupFiles', { count: files.length }) }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, files: [], message: i18n.t('webdav.listFilesTimeout') }
    }
    return { success: false, files: [], message: i18n.t('webdav.listFilesError', { error: e instanceof Error ? e.message : String(e) }) }
  }
}

export async function restoreFromWebDAV(
  config: WebDAVConfig,
  fileUrl?: string,
): Promise<{ success: boolean; data?: BackupData['data']; message: string }> {
  try {
    const url = fileUrl || getBackupUrl(config)
    // Validate URL ownership — same check as deleteWebDAVBackup
    if (fileUrl) {
      const configBaseUrl = config.url.endsWith('/') ? config.url : config.url + '/'
      if (!fileUrl.startsWith(configBaseUrl)) {
        return { success: false, message: i18n.t('webdav.restoreFailedUrlMismatch') }
      }
    }
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (!response.ok) {
      return { success: false, message: i18n.t('webdav.downloadFailed', { status: response.status }) }
    }

    const json = await response.text()
    const backupData: BackupData = parseBackupData(json)

    const data = getBackupRecords(backupData)
    return { success: true, data, message: i18n.t('webdav.restoreSuccess') }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: i18n.t('webdav.downloadTimeout') }
    }
    return { success: false, message: i18n.t('webdav.restoreFailedError', { error: e instanceof Error ? e.message : String(e) }) }
  }
}

export async function deleteWebDAVBackup(config: WebDAVConfig, fileUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate that the URL belongs to the configured WebDAV server
    const configBaseUrl = config.url.endsWith('/') ? config.url : config.url + '/'
    if (!fileUrl.startsWith(configBaseUrl)) {
      return { success: false, message: i18n.t('webdav.deleteFailedUrlMismatch') }
    }

    const response = await fetchWithTimeout(fileUrl, {
      method: 'DELETE',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (response.ok || response.status === 204) {
      return { success: true, message: i18n.t('webdav.deleteSuccess') }
    }
    return { success: false, message: i18n.t('webdav.deleteFailedHttp', { status: response.status }) }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: i18n.t('webdav.deleteTimeout') }
    }
    return { success: false, message: i18n.t('webdav.deleteFailedError', { error: e instanceof Error ? e.message : String(e) }) }
  }
}

export async function getBackupInfo(
  config: WebDAVConfig,
): Promise<{ success: boolean; info?: { backupTime: string; recordCount: number; hasSettings: boolean }; message: string }> {
  try {
    const response = await fetchWithTimeout(getBackupUrl(config), {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (!response.ok) {
      return { success: false, message: i18n.t('webdav.noBackupFile') }
    }

    const json = await response.text()
    const backupData: BackupData = parseBackupData(json)
    const recordCount =
      backupData.data.wordRecords.length +
      backupData.data.chapterRecords.length +
      backupData.data.reviewRecords.length +
      (backupData.data.favoriteRecords?.length ?? 0)
    const hasSettings = !!backupData.data.settings

    return {
      success: true,
      info: {
        backupTime: backupData.backupTime,
        recordCount,
        hasSettings,
      },
      message: i18n.t('webdav.lastBackupInfo', { time: backupData.backupTime, count: recordCount }),
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: i18n.t('webdav.getBackupInfoTimeout') }
    }
    return { success: false, message: i18n.t('webdav.getBackupInfoFailed', { error: e instanceof Error ? e.message : String(e) }) }
  }
}

/**
 * 启动同步：双向合并本地和远程数据
 * - 下载远程 latest.json
 * - 按自然键合并，复习进度取较大值，收藏按更新时间合并
 * - 更新本地 IndexedDB，保留已有记录的 id
 * - 上传合并结果到远程
 */
export async function startupSyncToWebDAV(
  config: WebDAVConfig,
): Promise<{ success: boolean; message: string; syncedCount?: number; settingsApplied?: boolean }> {
  return withBackupLock(async () => {
    try {
      const downloadResult = await downloadExistingBackup(config)

      if (!downloadResult.found && downloadResult.reason === 'error') {
        return { success: false, message: downloadResult.message }
      }
      const localData = await readLocalRecords()

      if (!downloadResult.found) {
        // 无远程备份 → 上传本地数据作为初始备份
        const backupData: BackupData = {
          backupVersion: '2.0',
          backupTime: new Date().toISOString(),
          data: { ...localData, settings: collectBackupSettings() },
        }
        const response = await fetchWithTimeout(getBackupUrl(config), {
          method: 'PUT',
          headers: { Authorization: getAuthHeader(config), 'Content-Type': 'application/octet-stream' },
          body: compress(backupData),
        })
        if (response.ok) {
          await setLastWebdavBackupTime(new Date().toISOString())
          return { success: true, message: i18n.t('webdav.firstSyncUploaded'), syncedCount: 0 }
        }
        return { success: false, message: i18n.t('webdav.syncFailedHttp', { status: response.status }) }
      }

      const remoteBackup = downloadResult.data

      const remoteData = getBackupRecords(remoteBackup)
      const remoteNewCount = await mergeBackupIntoLocal(remoteData)
      // Include practice records created while the remote file was downloading.
      const latestLocalData = await readLocalRecords()

      // Sync settings: remote wins if newer
      let settingsApplied = false
      if (remoteBackup.data.settings) {
        const lastBackupTime = await getLastWebdavBackupTime()
        const localTime = lastBackupTime ? new Date(lastBackupTime) : new Date(0)
        const remoteTime = new Date(remoteBackup.backupTime)
        if (remoteTime > localTime) {
          applyBackupSettings(remoteBackup.data.settings)
          settingsApplied = true
        }
      }

      // 上传合并结果到远程
      const backupData: BackupData = {
        backupVersion: '2.0',
        backupTime: new Date().toISOString(),
        data: { ...latestLocalData, settings: collectBackupSettings() },
      }
      const response = await fetchWithTimeout(getBackupUrl(config), {
        method: 'PUT',
        headers: { Authorization: getAuthHeader(config), 'Content-Type': 'application/octet-stream' },
        body: compress(backupData),
      })

      if (response.ok) {
        await setLastWebdavBackupTime(new Date().toISOString())
        return {
          success: true,
          message: i18n.t('webdav.syncSuccess', { count: remoteNewCount }),
          syncedCount: remoteNewCount,
          settingsApplied,
        }
      }
      return { success: false, message: i18n.t('webdav.syncFailedHttp', { status: response.status }) }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { success: false, message: i18n.t('webdav.syncTimeout') }
      }
      return { success: false, message: i18n.t('webdav.syncFailedError', { error: e instanceof Error ? e.message : String(e) }) }
    }
  })
}
