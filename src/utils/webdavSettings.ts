import { createEncryptedStorage } from './crypto'
import type { WebDAVConfig } from './webdav'
import Dexie from 'dexie'

export const defaultWebdavConfig: WebDAVConfig = {
  enabled: false,
  url: '',
  username: '',
  password: '',
  autoBackup: true,
}

interface SettingRecord {
  key: string
  value: string | null
  schemaVersion?: number
  updatedAt?: number
}

let settingsDB: Dexie | undefined
function settingsTable() {
  if (!settingsDB) {
    settingsDB = new Dexie('QwertySettingsDB')
    settingsDB.version(1).stores({ settings: 'key' })
  }
  return settingsDB.table<SettingRecord, string>('settings')
}

function recordStorage(values: Map<string, string | null>): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

function parseObject(text: string | null | undefined): Record<string, unknown> {
  try {
    const value = JSON.parse(text ?? 'null')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function legacyValue(key: string, existing?: SettingRecord): string | null {
  if (existing?.schemaVersion === 2) return existing.value
  // One-time migration also accepts the short-lived fallback used by older builds.
  try {
    const journal = parseObject(sessionStorage.getItem(`qwerty-setting:${key}`))
    if (typeof journal.value === 'string' && Number(journal.updatedAt ?? 0) >= (existing?.updatedAt ?? 0)) {
      return journal.value
    }
  } catch {
    /* storage may be unavailable */
  }
  if (existing) return existing.value
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function removeLegacy(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* already persisted in IndexedDB */
  }
  try {
    sessionStorage.removeItem(`qwerty-setting:${key}`)
  } catch {
    /* already persisted in IndexedDB */
  }
}

export async function saveWebdavSettings(config: WebDAVConfig): Promise<void> {
  const { username, password, ...options } = config
  const values = new Map<string, string | null>([['webdavConfig', JSON.stringify(options)]])
  createEncryptedStorage('webdavCredentials', recordStorage(values)).setItem('', { username, password })
  const table = settingsTable()
  await table.db.transaction('rw', table, () => table.bulkPut([...values].map(([key, value]) => ({ key, value, schemaVersion: 2 }))))
}

export async function loadWebdavSettings(): Promise<WebDAVConfig> {
  const [optionsRecord, credentialsRecord] = await settingsTable().bulkGet(['webdavConfig', 'webdavCredentials'])
  const options = parseObject(legacyValue('webdavConfig', optionsRecord))
  const values = new Map([['webdavCredentials', legacyValue('webdavCredentials', credentialsRecord)]])
  const decoded = createEncryptedStorage('webdavCredentials', recordStorage(values)).getItem('', {})
  const credentials = decoded && typeof decoded === 'object' ? (decoded as Record<string, unknown>) : {}
  const config: WebDAVConfig = {
    enabled: typeof options.enabled === 'boolean' ? options.enabled : false,
    url: typeof options.url === 'string' ? options.url : '',
    autoBackup: typeof options.autoBackup === 'boolean' ? options.autoBackup : true,
    username:
      typeof credentials.username === 'string' ? credentials.username : typeof options.username === 'string' ? options.username : '',
    password:
      typeof credentials.password === 'string' ? credentials.password : typeof options.password === 'string' ? options.password : '',
  }
  if (optionsRecord?.schemaVersion !== 2 || credentialsRecord?.schemaVersion !== 2) {
    await saveWebdavSettings(config)
    removeLegacy('webdavConfig')
    removeLegacy('webdavCredentials')
  }
  return config
}

export async function getLastWebdavBackupTime(): Promise<string | null> {
  const key = 'webdavLastBackupTime'
  const stored = await settingsTable().get(key)
  if (stored) return stored.value
  const legacy = legacyValue(key)
  await settingsTable().put({ key, value: legacy, schemaVersion: 2 })
  removeLegacy(key)
  return legacy
}

export async function setLastWebdavBackupTime(value: string): Promise<void> {
  await settingsTable().put({ key: 'webdavLastBackupTime', value, schemaVersion: 2 })
}
