import { CHAPTER_LENGTH } from '@/constants'
import type { PracticeContentType, Word } from '@/typings'
import type { PersonalDictionary } from '@/typings/personal'
import { db } from '@/utils/db/core'
import { contentTypeLabels, normalizePracticeText, practiceContentType } from '@/utils/practice'

export type ImportContentType = PracticeContentType | 'auto'
export type PracticeImportPreview = { items: Word[]; duplicates: number; issues: string[] }

export function mergePracticeItems(items: Word[]): Word[] {
  const merged = new Map<string, Word>()
  for (const item of items) {
    const key = normalizePracticeText(item.name)
    const previous = merged.get(key)
    merged.set(key, {
      ...previous,
      ...item,
      name: previous?.name ?? item.name,
      usphone: item.usphone || previous?.usphone || '',
      ukphone: item.ukphone || previous?.ukphone || '',
      trans: Array.from(new Set([...(previous?.trans ?? []), ...item.trans])),
    })
  }
  return Array.from(merged.values())
}

export function parsePracticeImport(text: string, contentType: ImportContentType): PracticeImportPreview {
  const issues: string[] = []
  let rows: unknown[]
  const input = text.replace(/^\uFEFF/, '').trim()
  if (!input) return { items: [], duplicates: 0, issues }
  if (input.startsWith('[') || input.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(input)
      if (!Array.isArray(parsed)) throw new Error()
      rows = parsed
    } catch {
      return { items: [], duplicates: 0, issues: ['JSON 格式不正确，请提供词条数组。'] }
    }
  } else {
    rows = input.split(/\r?\n/).map((line) => {
      if (!line.trim()) return null
      const columns = line.split('\t')
      if (columns.length > 2) return { invalid: true }
      return { name: columns[0], trans: columns[1] ? [columns[1]] : [] }
    })
  }
  const items: Word[] = []
  rows.forEach((row, index) => {
    if (row === null) return
    if (!row || typeof row !== 'object') {
      issues.push(`第 ${index + 1} 条格式不正确。`)
      return
    }
    const data = row as Record<string, unknown>
    const name = typeof data.name === 'string' ? data.name : data.text
    if (typeof name !== 'string' || !name.trim()) {
      issues.push(`第 ${index + 1} 条缺少英文内容。`)
      return
    }
    if (name.length > 2000) {
      issues.push(`第 ${index + 1} 条超过 2000 字符，请拆成短句。`)
      return
    }
    const suppliedType = data.contentType
    if (suppliedType !== undefined && !['word', 'phrase', 'sentence'].includes(String(suppliedType))) {
      issues.push(`第 ${index + 1} 条的 contentType 无效。`)
      return
    }
    const rawTrans = data.trans ?? data.translation ?? []
    if (!(typeof rawTrans === 'string' || (Array.isArray(rawTrans) && rawTrans.every((value) => typeof value === 'string')))) {
      issues.push(`第 ${index + 1} 条的中文释义格式不正确。`)
      return
    }
    const item: Word = {
      name: name.replace(/\s+/g, ' ').trim(),
      trans: (typeof rawTrans === 'string' ? [rawTrans] : (rawTrans as string[])).map((value) => value.trim()).filter(Boolean),
      usphone: typeof data.usphone === 'string' ? data.usphone : '',
      ukphone: typeof data.ukphone === 'string' ? data.ukphone : '',
    }
    item.contentType = contentType === 'auto' ? (suppliedType as PracticeContentType | undefined) ?? practiceContentType(item) : contentType
    items.push(item)
  })
  const unique = mergePracticeItems(items)
  return { items: unique, duplicates: items.length - unique.length, issues }
}

export async function savePersonalDictionary(name: string, items: Word[], existingId?: string): Promise<PersonalDictionary> {
  if (!items.length) throw new Error('没有可导入的内容。')
  if (!existingId && !name.trim()) throw new Error('请填写词书名称。')
  return db.transaction('rw', db.customDictionaries, async () => {
    const previous = existingId ? await db.customDictionaries.get(existingId) : undefined
    if (existingId && previous?.source !== 'custom') throw new Error('目标自定义词书不存在，请重新选择。')
    const words = mergePracticeItems([...(previous?.words ?? []), ...items])
    const updatedAt = Math.max(Date.now(), (previous?.updatedAt ?? 0) + 1)
    const id = previous?.id ?? `custom-${crypto.randomUUID()}`
    const kinds = Array.from(new Set(words.map((word) => contentTypeLabels[practiceContentType(word)])))
    const dictionary: PersonalDictionary = {
      id,
      name: previous?.name ?? name.trim(),
      source: 'custom',
      studyDate: '',
      updatedAt,
      description: `${kinds.join('、')} · ${words.length} 条`,
      category: '自定义词书',
      tags: ['个人导入'],
      language: 'en',
      languageCategory: 'en',
      url: `custom-dictionary://${id}?revision=${updatedAt}`,
      length: words.length,
      chapterCount: Math.ceil(words.length / CHAPTER_LENGTH),
      wordListRevision:
        previous && previous.words.map((word) => word.name).join('\n') === words.map((word) => word.name).join('\n')
          ? previous.wordListRevision
          : updatedAt,
      words,
      wordArchive: mergePracticeItems([...(previous?.wordArchive ?? []), ...words]),
    }
    await db.customDictionaries.put(dictionary)
    return dictionary
  })
}
