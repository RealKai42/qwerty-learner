import { CHAPTER_LENGTH } from '@/constants'
import type { Dictionary, Word } from '@/typings'
import type { CustomDictionary } from '@/typings/memo'
import { db } from '@/utils/db/core'
import { memoStudyDate } from '@/utils/memo-study-day'
import type { Table } from 'dexie'

export const MEMO_HISTORY_ID = 'maimemo-history'

export function isMemoDictionary(dictionary: Pick<Dictionary, 'id' | 'source'>): boolean {
  return dictionary.source === 'maimemo' || dictionary.id.startsWith('maimemo-')
}

export function isExpiredMemoDictionary(dictionary: CustomDictionary, today = memoStudyDate()): boolean {
  return isMemoDictionary(dictionary) && dictionary.id !== MEMO_HISTORY_ID && dictionary.studyDate !== today
}

export function wordKey(name: string): string {
  return name.trim().toLowerCase()
}

export async function putStudyRecord<T extends { dict: string; originalDict?: string }>(
  table: Table<T, number>,
  record: T,
): Promise<number> {
  if (!record.dict.startsWith('maimemo-') || record.dict === MEMO_HISTORY_ID) return table.put(record)
  // Serialize late practice writes with imports that archive the original daily book.
  return db.transaction('rw', db.customDictionaries, table, async () => {
    const history = await db.customDictionaries.get(MEMO_HISTORY_ID)
    if (history?.historySources?.[record.dict]) {
      record.originalDict ??= record.dict
      record.dict = MEMO_HISTORY_ID
    }
    return table.put(record)
  })
}

export function mergeMemoWords(words: Word[]): Word[] {
  const merged = new Map<string, Word>()
  words.forEach((word) => {
    const key = wordKey(word.name)
    if (!key) return
    const previous = merged.get(key)
    merged.set(key, {
      ...word,
      ...previous,
      name: previous?.name ?? word.name.trim(),
      trans: Array.from(new Set([...(previous?.trans ?? []), ...word.trans].map((value) => value.trim()).filter(Boolean))),
      usphone: previous?.usphone || word.usphone,
      ukphone: previous?.ukphone || word.ukphone,
      ...(previous?.notation || word.notation ? { notation: previous?.notation || word.notation } : {}),
    })
  })
  return Array.from(merged.values())
}

export async function rolloverMemoDictionaries(now?: Date): Promise<void> {
  await db.transaction('rw', db.customDictionaries, db.wordRecords, db.chapterRecords, db.reviewRecords, async () => {
    const today = memoStudyDate(now ?? new Date())
    const dictionaries = await db.customDictionaries.orderBy('studyDate').toArray()
    const expired = dictionaries.filter((dictionary) => isExpiredMemoDictionary(dictionary, today))
    if (!expired.length) return
    const previous = dictionaries.find((dictionary) => dictionary.id === MEMO_HISTORY_ID)
    const words = mergeMemoWords([
      ...(previous?.words ?? []),
      ...(previous?.wordArchive ?? []),
      ...expired.flatMap((dictionary) => [...dictionary.words, ...dictionary.wordArchive]),
    ])
    const updatedAt = Math.max(Date.now(), ...[previous, ...expired].map((dictionary) => (dictionary?.updatedAt ?? 0) + 1))
    const historySources = { ...previous?.historySources }
    expired.forEach((dictionary) => {
      historySources[dictionary.id] = {
        studyDate: dictionary.studyDate,
        name: dictionary.name,
        responseTypes: [...dictionary.responseTypes],
        wordNames: dictionary.words.map((word) => word.name),
        wordListRevision: dictionary.wordListRevision,
      }
    })
    const history: CustomDictionary = {
      id: MEMO_HISTORY_ID,
      name: '往日词汇',
      description: `已合并 ${Object.keys(historySources).length} 本往日词书`,
      source: 'maimemo',
      kind: 'history',
      studyDate: '',
      updatedAt,
      responseTypes: Array.from(
        new Set([...(previous?.responseTypes ?? []), ...expired.flatMap((dictionary) => dictionary.responseTypes)]),
      ),
      historySources,
      category: '个人词书',
      tags: ['墨墨每日词汇'],
      url: `custom-dictionary://${MEMO_HISTORY_ID}?revision=${updatedAt}`,
      length: words.length,
      chapterCount: Math.ceil(words.length / CHAPTER_LENGTH),
      wordListRevision:
        previous && previous.words.map((word) => word.name).join('\n') === words.map((word) => word.name).join('\n')
          ? previous.wordListRevision
          : updatedAt,
      language: 'en',
      languageCategory: 'en',
      words,
      wordArchive: words,
    }
    await db.customDictionaries.put(history)
    for (const dictionary of expired) {
      const migrate = (record: { dict: string; originalDict?: string }) => {
        record.originalDict ??= record.dict
        record.dict = MEMO_HISTORY_ID
      }
      // Record primary keys, timestamps, counts, chapter snapshots and review progress stay intact.
      await db.wordRecords.where('dict').equals(dictionary.id).modify(migrate)
      await db.chapterRecords.where('dict').equals(dictionary.id).modify(migrate)
      await db.reviewRecords.where('dict').equals(dictionary.id).modify(migrate)
      await db.customDictionaries.delete(dictionary.id)
    }
  })
}
