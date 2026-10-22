import { CHAPTER_LENGTH } from '@/constants'
import type { CustomDictionary, MemoItem, MemoResponseType, MemoToday } from '@/typings/memo'
import { memoResponseOptions } from '@/typings/memo'
import { db } from '@/utils/db/core'

export function memoResponseType(response: string): MemoResponseType {
  return memoResponseOptions.find((option) => option.value === response)?.value ?? 'OTHER'
}

export async function fetchMemoToday(): Promise<MemoToday> {
  let response: Response
  try {
    response = await fetch('/api/memo/today', { method: 'POST', headers: { Accept: 'application/json' } })
  } catch {
    throw new Error('无法连接导入服务，请确认个人墨墨服务正在运行。')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || !data || !Array.isArray(data.items)) {
    throw new Error(data?.error || '导入服务不可用。请使用已配置墨墨账号的个人服务打开网站。')
  }
  return data as MemoToday
}

export async function saveMemoDictionary(snapshot: MemoToday, types: MemoResponseType[]): Promise<CustomDictionary> {
  if (!types.length) throw new Error('请至少选择一种词汇类型。')
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  )
  if (snapshot.date !== today) throw new Error('已跨过北京时间零点，请重新读取今日词汇。')
  const items = snapshot.items.filter((item) => types.includes(memoResponseType(item.response)))
  const unique = new Map<string, MemoItem>()
  items.forEach((item) => unique.set(item.word.name, item))
  const words = Array.from(unique.values()).map((item) => item.word)
  if (!words.length) throw new Error('所选类型没有已完成的单词，原有词书未修改。')
  const responseTypes = types.filter((type) => type !== 'OTHER' || items.some((item) => memoResponseType(item.response) === 'OTHER'))
  const id = `maimemo-${snapshot.date}`
  return db.transaction('rw', db.customDictionaries, async () => {
    const previous = await db.customDictionaries.get(id)
    const updatedAt = Math.max(Date.now(), (previous?.updatedAt ?? 0) + 1)
    const archive = new Map((previous?.wordArchive ?? []).map((word) => [word.name, word]))
    words.forEach((word) => archive.set(word.name, word))
    const labels = memoResponseOptions.filter((option) => responseTypes.includes(option.value)).map((option) => option.label)
    const dictionary: CustomDictionary = {
      id,
      name: `墨墨每日词汇 · ${snapshot.date}`,
      description: `已完成 · ${labels.join('、')}`,
      source: 'maimemo',
      studyDate: snapshot.date,
      updatedAt,
      responseTypes,
      category: '个人词书',
      tags: ['墨墨每日词汇'],
      url: `custom-dictionary://${id}?revision=${updatedAt}`,
      length: words.length,
      chapterCount: Math.ceil(words.length / CHAPTER_LENGTH),
      wordListRevision:
        previous && previous.words.map((word) => word.name).join('\n') === words.map((word) => word.name).join('\n')
          ? previous.wordListRevision
          : updatedAt,
      language: 'en',
      languageCategory: 'en',
      words,
      wordArchive: Array.from(archive.values()),
    }
    await db.customDictionaries.put(dictionary)
    return dictionary
  })
}

export function archiveWordListUrl(url: string) {
  return url.startsWith('custom-dictionary://') ? `${url}&archive=1` : url
}
