import zh from '../../src/i18n/locales/zh.json'
import type { BackupData } from '../../src/utils/webdav'
import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'
import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import i18n from 'i18next'
import { inflate } from 'pako'

Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange
const settingsDB = new Dexie('QwertySettingsDB', { indexedDB, IDBKeyRange })
settingsDB.version(1).stores({ settings: 'key' })

// Exercise real Dexie transactions without importing the application's UI graph.
const db = new Dexie('webdav-regression-tests', { indexedDB, IDBKeyRange })
db.version(4).stores({
  wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
  chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
  reviewRecords: '++id,dict,createTime,isFinished',
  favoriteRecords: '++id,word,dict,chapter,timeStamp',
})
mock.module(new URL('../../src/utils/db/index.ts', import.meta.url).pathname, () => ({ db }))
const { fullBackupToWebDAV, incrementalBackupToWebDAV, startupSyncToWebDAV, mergeBackupIntoLocal, restoreFromWebDAV } =
  await import('../../src/utils/webdav')
const { getFavoriteRecords, toggleFavoriteRecord } = await import('../../src/utils/db/favorites')
await i18n.init({ lng: 'zh', resources: { zh: { translation: zh } } })

const storage = new Map<string, string>()
const originalStorage = globalThis.localStorage
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
  },
})
const originalFetch = globalThis.fetch
const config = { enabled: true, autoBackup: true, url: 'https://example.invalid/dav', username: 'test', password: 'test' }
const emptyData = (): BackupData['data'] => ({ wordRecords: [], chapterRecords: [], reviewRecords: [], favoriteRecords: [] })
const word = (name = 'cancel', timeStamp = 1767225600) => ({
  word: name,
  dict: 'cet4',
  chapter: 0,
  timeStamp,
  timing: [100],
  wrongCount: 0,
  mistakes: {},
})
const review = (index: number, isFinished = false) => ({
  dict: 'cet4',
  createTime: 100,
  index,
  isFinished,
  words: [{ name: 'cancel', trans: ['取消'] }],
})
const favorite = { word: 'cancel', dict: 'cet4', chapter: 0, timeStamp: 100 }
let remote: BackupData
let rawBody: string | undefined
let readStatus: number
let readError: Error | undefined
let latestWriteStatus: number
let uploads: { url: string; backup: BackupData }[]

beforeEach(async () => {
  await Promise.all([...db.tables, ...settingsDB.tables].map((table) => table.clear()))
  storage.clear()
  remote = { backupVersion: '2.0', backupTime: '2026-01-01T00:00:00.000Z', data: emptyData() }
  rawBody = undefined
  readStatus = 200
  readError = undefined
  latestWriteStatus = 200
  uploads = []
  globalThis.fetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
    if (init?.method !== 'PUT') {
      if (readError) throw readError
      return new Response(rawBody ?? JSON.stringify(remote), { status: readStatus })
    }
    const bytes = Uint8Array.from(atob(init.body as string), (char) => char.charCodeAt(0))
    const backup = JSON.parse(inflate(bytes, { toText: true })) as BackupData
    const url = String(input)
    uploads.push({ url, backup })
    const status = url.endsWith('latest.jsonz') ? latestWriteStatus : 200
    if (status === 200 && url.endsWith('latest.jsonz')) remote = backup
    return new Response('', { status })
  }) as typeof fetch
})

afterAll(async () => {
  globalThis.fetch = originalFetch
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalStorage })
  await db.delete()
  settingsDB.close()
})

const operations = {
  startup: () => startupSyncToWebDAV(config),
  incremental: () => incrementalBackupToWebDAV(emptyData(), config),
  full: () => fullBackupToWebDAV(emptyData(), config),
}

describe('failed reads never overwrite a remote backup', () => {
  for (const [name, operation] of Object.entries(operations)) {
    for (const status of [401, 500]) {
      test(`${name}: HTTP ${status}`, async () => {
        readStatus = status
        expect((await operation()).success).toBe(false)
        expect(uploads).toHaveLength(0)
        expect(storage.has('webdavLastBackupTime')).toBe(false)
      })
    }
    test(`${name}: network failure`, async () => {
      readError = new TypeError('Failed to fetch')
      expect((await operation()).success).toBe(false)
      expect(uploads).toHaveLength(0)
    })
    test(`${name}: malformed backup`, async () => {
      rawBody = '{invalid JSON'
      expect((await operation()).success).toBe(false)
      expect(uploads).toHaveLength(0)
    })
    test(`${name}: malformed favorites table`, async () => {
      remote.data.favoriteRecords = {} as unknown[]
      expect((await operation()).success).toBe(false)
      expect(uploads).toHaveLength(0)
    })
  }
})

test('only a 404 initializes a backup, including records older than the previous watermark', async () => {
  readStatus = 404
  storage.set('webdavLastBackupTime', '2030-01-01T00:00:00.200Z')
  const data = { ...emptyData(), wordRecords: [word()] }
  expect((await incrementalBackupToWebDAV(data, config)).success).toBe(true)
  expect(uploads.at(-1)!.backup.data.wordRecords).toEqual(data.wordRecords)
})

test('a record created later within the same second is uploaded', async () => {
  storage.set('webdavLastBackupTime', '2026-01-01T00:00:00.200Z')
  const data = { ...emptyData(), wordRecords: [word()] }
  expect((await incrementalBackupToWebDAV(data, config)).success).toBe(true)
  expect(uploads.at(-1)!.backup.data.wordRecords).toEqual(data.wordRecords)
})

test('unchanged backups skip PUT after checking the remote contents', async () => {
  expect((await incrementalBackupToWebDAV(emptyData(), config)).success).toBe(true)
  expect(uploads).toHaveLength(0)
})

test('incremental backup reports changed records rather than all local history', async () => {
  remote.data.wordRecords = [word()]
  const result = await incrementalBackupToWebDAV({ ...emptyData(), wordRecords: [word(), word('new')] }, config)
  expect(result.success).toBe(true)
  expect(result.message).toBe(i18n.t('webdav.incrementalBackupSuccess', { count: 1 }))
  expect(remote.data.wordRecords).toHaveLength(2)
})

test('edits to an old review session are backed up without adding duplicate sessions', async () => {
  storage.set('webdavLastBackupTime', '2026-01-01T00:00:00.200Z')
  remote.data.reviewRecords = [review(0)]
  const data = { ...emptyData(), reviewRecords: [review(10, true)] }
  expect((await incrementalBackupToWebDAV(data, config)).success).toBe(true)
  expect(uploads.at(-1)!.backup.data.reviewRecords).toEqual([review(10, true)])
})

test('startup sync adopts newer remote review progress and preserves local IDs', async () => {
  const id = await db.table('reviewRecords').add(review(0))
  remote.data.reviewRecords = [{ ...review(10, true), id: 99 }]
  expect((await startupSyncToWebDAV(config)).success).toBe(true)
  expect(await db.table('reviewRecords').toArray()).toEqual([{ ...review(10, true), id }])
  expect(remote.data.reviewRecords).toEqual([{ ...review(10, true), id }])
  expect((await startupSyncToWebDAV(config)).syncedCount).toBe(0)
})

test('manual restore cannot move review progress backwards or reopen a finished session', async () => {
  const id = await db.table('reviewRecords').add(review(10, true))
  expect(await mergeBackupIntoLocal({ ...emptyData(), reviewRecords: [review(0)] })).toBe(0)
  expect(await db.table('reviewRecords').get(id)).toEqual({ ...review(10, true), id })
})

test('canceling a favorite creates a hidden deletion marker that survives backup and another device sync', async () => {
  await db.table('favoriteRecords').add(favorite)
  remote.data.favoriteRecords = [favorite]
  expect(await toggleFavoriteRecord('cancel', 'cet4', 0)).toBe(false)
  expect(await getFavoriteRecords()).toEqual([])
  const removed = await db.table('favoriteRecords').toArray()
  expect(removed[0].deleted).toBe(true)
  expect((await incrementalBackupToWebDAV({ ...emptyData(), favoriteRecords: removed }, config)).success).toBe(true)
  expect((remote.data.favoriteRecords[0] as (typeof removed)[0]).deleted).toBe(true)
  await db.table('favoriteRecords').clear()
  expect((await startupSyncToWebDAV(config)).success).toBe(true)
  expect(await getFavoriteRecords()).toEqual([])
  expect(await db.table('favoriteRecords').count()).toBe(1)
})

test('a stale remote favorite cannot resurrect a local deletion', async () => {
  const deleted = { ...favorite, deleted: true, updatedAt: 100001 }
  await db.table('favoriteRecords').add(deleted)
  remote.data.favoriteRecords = [favorite]
  expect((await startupSyncToWebDAV(config)).success).toBe(true)
  expect(await getFavoriteRecords()).toEqual([])
  expect((remote.data.favoriteRecords[0] as typeof deleted).deleted).toBe(true)
})

test('remote deletion hides a locally cached favorite and keeps its local primary key', async () => {
  const id = await db.table('favoriteRecords').add(favorite)
  remote.data.favoriteRecords = [{ ...favorite, id: 99, deleted: true, updatedAt: 100001 }]
  expect((await startupSyncToWebDAV(config)).success).toBe(true)
  expect(await getFavoriteRecords()).toEqual([])
  expect((await db.table('favoriteRecords').toArray())[0].id).toBe(id)
})

test('explicitly re-adding a favorite wins over an older deletion without duplicate rows', async () => {
  const deletion = { ...favorite, deleted: true, updatedAt: Date.now() }
  await db.table('favoriteRecords').add(deletion)
  expect(await toggleFavoriteRecord('cancel', 'cet4', 0)).toBe(true)
  expect((await getFavoriteRecords())[0].updatedAt).toBeGreaterThan(deletion.updatedAt)
  await mergeBackupIntoLocal({ ...emptyData(), favoriteRecords: [deletion] })
  expect(await getFavoriteRecords()).toHaveLength(1)
  expect(await db.table('favoriteRecords').count()).toBe(1)
})

test("full backup preserves another device's progress in latest while keeping a separate local snapshot", async () => {
  remote.data.reviewRecords = [review(10, true)]
  expect((await fullBackupToWebDAV({ ...emptyData(), reviewRecords: [review(0)] }, config)).success).toBe(true)
  expect(uploads).toHaveLength(2)
  expect(uploads[0].backup.data.reviewRecords).toEqual([review(0)])
  expect(uploads[1].backup.data.reviewRecords).toEqual([review(10, true)])
})

test('a failed latest-file write does not advance the last successful sync time', async () => {
  latestWriteStatus = 500
  storage.set('webdavLastBackupTime', 'previous')
  await fullBackupToWebDAV(emptyData(), config)
  expect(storage.get('webdavLastBackupTime')).toBe('previous')
})

test('legacy backups without favorites still restore', async () => {
  delete (remote.data as Partial<BackupData['data']>).favoriteRecords
  const result = await restoreFromWebDAV(config)
  expect(result.success).toBe(true)
  expect(result.data!.favoriteRecords).toEqual([])
})
