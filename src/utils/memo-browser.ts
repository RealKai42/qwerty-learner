import type { Word } from '@/typings'
import type { MemoSettings, MemoToday } from '@/typings/memo'
import { memoStudyDate } from '@/utils/memo-study-day'

const TOKEN_KEY = 'maimemo-token'
const API_BASE = 'https://open.maimemo.com/open/api/v1'
type Entry = Pick<Word, 'trans' | 'usphone' | 'ukphone'>
type StudyItem = {
  voc_id: string
  voc_spelling: string
  is_finished: boolean
  first_response?: string
  is_new?: boolean
  order?: number
}
let indexPromise: Promise<Map<string, Entry>> | undefined

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    throw new Error('无法读取墨墨 Token，请允许浏览器保存此网站的数据。')
  }
}

export function browserMemoSettings(method: string, value?: string): MemoSettings {
  try {
    if (method === 'POST') {
      const token = value?.trim().replace(/^Bearer\s+/i, '')
      if (!token || token.length > 4096 || /[^\x21-\x7e]/.test(token)) throw new Error('Token 格式不正确，请重新复制。')
      localStorage.setItem(TOKEN_KEY, token)
    } else if (method === 'DELETE') localStorage.removeItem(TOKEN_KEY)
    else if (method !== 'GET') throw new Error('不支持的墨墨设置操作。')
  } catch (error) {
    if (error instanceof DOMException) throw new Error('无法保存墨墨 Token，请允许浏览器保存此网站的数据。')
    throw error
  }
  const configured = Boolean(readToken())
  return { configured, source: configured ? 'browser' : 'none' }
}

async function requestMemo<T>(endpoint: string, token: string, body: object): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 20000)
  let response: Response
  let result: { success?: boolean; data?: T } | null
  try {
    response = await fetch(API_BASE + endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    result = await response.json().catch(() => null)
  } catch {
    throw new Error('连接墨墨失败，请检查网络后重试。')
  } finally {
    window.clearTimeout(timer)
  }
  if (response.status === 401 || response.status === 403) throw new Error('墨墨凭证已过期或无权访问，请在墨墨设置中更新 Token。')
  if (response.status === 429) throw new Error('墨墨请求次数过多，请稍后重试。')
  if (!response.ok) throw new Error('墨墨服务暂时不可用，请稍后重试。')
  if (result?.success === false || !result?.data) {
    throw new Error('墨墨未返回有效学习数据，请确认 App 已开启自动同步，并在今天打开过 App。')
  }
  return result.data as T
}

function loadBrowserWordIndex(): Promise<Map<string, Entry>> {
  indexPromise ||= (async () => {
    const prefix = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
    const [response, { ungzip }] = await Promise.all([fetch(`${prefix}/memo-word-index.json.gz`), import('pako')])
    if (!response.ok) throw new Error('词库索引不可用。')
    const data: Record<string, Entry> = JSON.parse(ungzip(await response.arrayBuffer(), { to: 'string' }))
    return new Map(Object.entries(data))
  })().catch(() => {
    indexPromise = undefined
    throw new Error('本地释义加载失败，请重试。')
  })
  return indexPromise
}

export async function fetchMemoBrowserToday(): Promise<MemoToday> {
  const token = readToken()
  if (!token) throw new Error('尚未配置墨墨账号，请先在设置 → 墨墨设置中保存 Token。')
  const date = memoStudyDate()
  const [data, progressData] = await Promise.all([
    requestMemo<{ today_items?: StudyItem[] }>('/study/get_today_items', token, { is_finished: true, limit: 1000 }),
    requestMemo<{ progress?: { finished?: number } }>('/study/get_study_progress', token, {}),
  ])
  const completed = progressData.progress?.finished
  if (!Array.isArray(data.today_items) || typeof completed !== 'number' || !Number.isInteger(completed)) {
    throw new Error('墨墨学习数据格式已变化，请稍后重试。')
  }
  const unique = new Map<string, StudyItem>()
  for (const item of data.today_items) {
    if (item.is_finished !== true) continue
    if (typeof item.voc_id !== 'string' || typeof item.voc_spelling !== 'string' || !item.voc_spelling.trim()) {
      throw new Error('墨墨返回的单词数据不完整，本次未导入。')
    }
    unique.set(item.voc_id, item)
  }
  if (data.today_items.length >= 1000 || completed > unique.size) {
    throw new Error('今日词汇可能尚未同步完整，或超出接口 1000 词上限。请同步 App 后重试，本次未导入。')
  }
  const index = unique.size ? await loadBrowserWordIndex() : new Map<string, Entry>()
  const items = Array.from(unique.values())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => {
      const name = item.voc_spelling.trim()
      const entry = index.get(name.toLowerCase())
      return {
        vocId: item.voc_id,
        response: item.first_response || 'STUDY_RESPONSE_UNSPECIFIED',
        isNew: item.is_new === true,
        word: { name, trans: entry?.trans || [], usphone: entry?.usphone || '', ukphone: entry?.ukphone || '' },
      }
    })
  const fetchedAt = new Date()
  if (date !== memoStudyDate(fetchedAt)) throw new Error('导入过程中已跨过北京时间 04:00，请重新读取今日词汇。')
  return { date, fetchedAt: fetchedAt.toISOString(), completed, items }
}
