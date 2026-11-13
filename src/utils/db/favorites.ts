import { db } from '@/utils/db'
import type { IFavoriteRecord } from '@/utils/db/record'

export const FAVORITES_SWR_KEY = 'favorite-records'

export async function getFavoriteRecords(): Promise<IFavoriteRecord[]> {
  return db.favoriteRecords
    .orderBy('timeStamp')
    .reverse()
    .filter((record) => !record.deleted)
    .toArray()
}

export async function toggleFavoriteRecord(word: string, dict: string, chapter: number | null): Promise<boolean> {
  return db.transaction('rw', db.favoriteRecords, async () => {
    const records = await db.favoriteRecords.where({ word, dict }).toArray()
    records.sort((a, b) => (b.updatedAt ?? b.timeStamp * 1000) - (a.updatedAt ?? a.timeStamp * 1000))
    const existing = records[0]
    const isFavorite = !existing || !!existing.deleted
    const updatedAt = Math.max(Date.now(), (existing?.updatedAt ?? (existing?.timeStamp ?? 0) * 1000) + 1)
    const record: IFavoriteRecord = {
      ...existing,
      word,
      dict,
      chapter,
      timeStamp: isFavorite ? Math.floor(updatedAt / 1000) : existing.timeStamp,
      updatedAt,
      deleted: !isFavorite,
    }
    // Consolidate any duplicates created by older versions in the same transaction.
    await db.favoriteRecords.bulkDelete(records.slice(1).flatMap((r) => (r.id === undefined ? [] : [r.id])))
    await db.favoriteRecords.put(record)
    return isFavorite
  })
}
