import { createEncryptedStorage } from '../../src/utils/crypto'
import {
  defaultWebdavConfig,
  getLastWebdavBackupTime,
  loadWebdavSettings,
  saveWebdavSettings,
  setLastWebdavBackupTime,
} from '../../src/utils/webdavSettings'
import { afterAll, beforeEach, expect, test } from 'bun:test'
import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'

Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange
const db = new Dexie('QwertySettingsDB', { indexedDB, IDBKeyRange })
db.version(1).stores({ settings: 'key' })
const primary = new Map<string, string>()
const session = new Map<string, string>()
const previousLocal = globalThis.localStorage
const previousSession = globalThis.sessionStorage
const adapter = (values: Map<string, string>) => ({
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    values.set(key, value)
  },
  removeItem: (key: string) => {
    values.delete(key)
  },
})
const config = { ...defaultWebdavConfig, url: 'https://example.invalid/dav', username: 'qwer-learning 用户', password: '密码-test' }

beforeEach(async () => {
  await db.table('settings').clear()
  primary.clear()
  session.clear()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: adapter(primary) })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: adapter(session) })
})

afterAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previousLocal })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: previousSession })
  db.close()
})

test('config and UTF-8 credentials round trip through IndexedDB without Web Storage writes', async () => {
  await saveWebdavSettings(config)
  expect(await loadWebdavSettings()).toEqual(config)
  expect(primary.size).toBe(0)
  expect(session.size).toBe(0)
  const credentials = await db.table('settings').get('webdavCredentials')
  expect(credentials.value).not.toContain(config.password)
  expect(credentials.schemaVersion).toBe(2)
})

test('legacy encoded credentials migrate once and unrelated application data stays intact', async () => {
  primary.set('other-app-data', 'keep-me')
  primary.set('webdavConfig', JSON.stringify({ enabled: true, url: config.url, autoBackup: false }))
  createEncryptedStorage('webdavCredentials', adapter(primary)).setItem('', { username: config.username, password: config.password })
  expect(await loadWebdavSettings()).toEqual({ ...config, enabled: true, autoBackup: false })
  expect(primary.has('webdavConfig')).toBe(false)
  expect(primary.has('webdavCredentials')).toBe(false)
  expect(primary.get('other-app-data')).toBe('keep-me')
})

test('older configs containing credentials in the same object migrate correctly', async () => {
  primary.set('webdavConfig', JSON.stringify(config))
  expect(await loadWebdavSettings()).toEqual(config)
})

test('an interrupted fallback journal is migrated without losing the latest username', async () => {
  const encoded = new Map<string, string>()
  createEncryptedStorage('webdavCredentials', adapter(encoded)).setItem('', { username: config.username, password: config.password })
  await db.table('settings').put({ key: 'webdavConfig', value: JSON.stringify(config), updatedAt: 1 })
  session.set('qwerty-setting:webdavCredentials', JSON.stringify({ value: encoded.get('webdavCredentials'), updatedAt: 2 }))
  expect(await loadWebdavSettings()).toEqual(config)
  expect(session.has('qwerty-setting:webdavCredentials')).toBe(false)
})

test('saved settings load even when both Web Storage APIs are unavailable', async () => {
  await saveWebdavSettings(config)
  let calls = 0
  const unavailable = {
    getItem() {
      calls += 1
      throw new Error('Do not read Web Storage')
    },
    setItem() {
      calls += 1
      throw new Error('Do not write Web Storage')
    },
    removeItem() {
      calls += 1
      throw new Error('Do not remove Web Storage')
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: unavailable })
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: unavailable })
  expect(await loadWebdavSettings()).toEqual(config)
  await saveWebdavSettings({ ...config, username: 'new-name' })
  expect((await loadWebdavSettings()).username).toBe('new-name')
  expect(calls).toBe(0)
})

test('backup timestamps migrate and are subsequently stored only in IndexedDB', async () => {
  primary.set('webdavLastBackupTime', '2026-01-01T00:00:00.000Z')
  expect(await getLastWebdavBackupTime()).toBe('2026-01-01T00:00:00.000Z')
  expect(primary.has('webdavLastBackupTime')).toBe(false)
  await setLastWebdavBackupTime('2026-02-01T00:00:00.000Z')
  expect(await getLastWebdavBackupTime()).toBe('2026-02-01T00:00:00.000Z')
  expect(primary.size).toBe(0)
})
