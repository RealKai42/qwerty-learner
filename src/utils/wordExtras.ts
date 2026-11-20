/**
 * 单词扩展信息：图片 / 词性 / 语块
 * Word extras: image, part of speech (POS), chunks.
 *
 * 数据来源优先级 / Source priority (first one that has data wins, per field):
 *   1. 词典 JSON 里单词自带的字段 (word.pos / word.chunks / word.image)
 *   2. 覆盖文件 public/extras/<dictId>.json（用 scripts/enrich-dict.mjs 生成，带中文）
 *   3. 从释义里解析词性，例如 "n. 苹果" → n.
 *   4. 在线查询（可在设置里关闭）：
 *        词性 POS   → dictionaryapi.dev
 *        语块 chunk → Datamuse（英文搭配，无中文）
 *        图片 image → Pixabay（需 key）→ Openverse → Wikipedia
 * 在线结果缓存到 localStorage，同一个词只查一次。
 */
import type { Word, WordChunk } from '@/typings'

export type WordExtras = {
  pos: string[]
  chunks: WordChunk[]
  image?: string
}

export type ExtrasOptions = {
  dictId: string
  onlineLookup: boolean
  pixabayKey?: string
}

// ---------- 词性标签 / POS labels ----------

const POS_ZH: Record<string, string> = {
  'n.': '名词',
  'v.': '动词',
  'vt.': '及物动词',
  'vi.': '不及物动词',
  'adj.': '形容词',
  'a.': '形容词',
  'adv.': '副词',
  'ad.': '副词',
  'prep.': '介词',
  'conj.': '连词',
  'pron.': '代词',
  'int.': '感叹词',
  'interj.': '感叹词',
  'num.': '数词',
  'art.': '冠词',
  'aux.': '助动词',
  'modal.': '情态动词',
  'abbr.': '缩写',
  'phr.': '短语',
}

// dictionaryapi.dev 返回的是英文全称，转成缩写
const POS_FROM_ENGLISH: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  preposition: 'prep.',
  conjunction: 'conj.',
  pronoun: 'pron.',
  interjection: 'int.',
  numeral: 'num.',
  article: 'art.',
  determiner: 'det.',
  abbreviation: 'abbr.',
}

export function posLabelZh(pos: string): string {
  return POS_ZH[normalizePos(pos)] ?? ''
}

function normalizePos(pos: string): string {
  let p = pos.trim().toLowerCase()
  if (POS_FROM_ENGLISH[p]) return POS_FROM_ENGLISH[p]
  if (!p.endsWith('.')) p += '.'
  if (p === 'a.') return 'adj.'
  if (p === 'ad.') return 'adv.'
  return p
}

const POS_RE = /(?:^|[\s；;，,])((?:n|v|vt|vi|adj|a|adv|ad|prep|conj|pron|int|interj|num|art|aux|modal|abbr|phr)\.)/gi

/** 从释义中解析词性 / parse POS from translations like "n. 苹果；v. 跑" */
export function parsePosFromTrans(trans: string[]): string[] {
  const found = new Set<string>()
  for (const t of trans) {
    let m: RegExpExecArray | null
    POS_RE.lastIndex = 0
    while ((m = POS_RE.exec(t))) found.add(normalizePos(m[1]))
  }
  // vt./vi. 已经说明是动词，不再单独显示 v.
  if ((found.has('vt.') || found.has('vi.')) && found.has('v.')) found.delete('v.')
  return Array.from(found)
}

function uniq<T>(arr: T[], key: (x: T) => string = String): T[] {
  const seen = new Set<string>()
  return arr.filter((x) => {
    const k = key(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ---------- 覆盖文件 / overlay file (public/extras/<dictId>.json) ----------

type OverlayEntry = Partial<Pick<Word, 'pos' | 'chunks' | 'image' | 'imageQuery'>>
const overlayCache = new Map<string, Promise<Record<string, OverlayEntry>>>()

function loadOverlay(dictId: string): Promise<Record<string, OverlayEntry>> {
  if (!overlayCache.has(dictId)) {
    const prefix = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
    overlayCache.set(
      dictId,
      fetch(`${prefix}/extras/${dictId}.json`)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
    )
  }
  return overlayCache.get(dictId)!
}

// ---------- 本地缓存 / localStorage cache ----------

const CACHE_PREFIX = 'wordExtras:v1:'

function readCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    // 存储满了就算了 / ignore quota errors
  }
}

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = readCache<T>(key)
  if (hit !== undefined) return hit
  const value = await fn()
  writeCache(key, value)
  return value
}

async function getJson(url: string): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// ---------- 在线：词性 / online POS ----------

async function fetchPosOnline(word: string): Promise<string[]> {
  return cached(`pos:${word}`, async () => {
    try {
      const data = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
      const list: string[] = []
      for (const entry of data ?? []) for (const m of entry.meanings ?? []) list.push(normalizePos(m.partOfSpeech))
      return uniq(list)
    } catch {
      return []
    }
  })
}

// ---------- 在线：语块 / online chunks (Datamuse) ----------

// 没意义的搭配词（冠词、代词等）；介词保留，因为 "depend on" 这类非常有用
const FILLER = new Set(
  'the a an this that these those it its he she they them his her their my your our we you i me him us is are was were be been am to and or but of s t not'.split(
    ' ',
  ),
)
const PREPS = new Set('on in at for with from about of to into over by against through'.split(' '))

async function fetchChunksOnline(word: string): Promise<WordChunk[]> {
  if (word.includes(' ')) return []
  return cached(`chunks:${word}`, async () => {
    const base = 'https://api.datamuse.com/words?max=12&'
    const q = encodeURIComponent(word)
    const [after, before, adjs] = await Promise.all([
      getJson(`${base}lc=${q}`).catch(() => []), // word ___
      getJson(`${base}rc=${q}`).catch(() => []), // ___ word
      getJson(`${base}rel_jjb=${q}`).catch(() => []), // adj + noun
    ])
    const ok = (w: string) => /^[a-z]+$/i.test(w) && w.toLowerCase() !== word.toLowerCase()
    const chunks: string[] = []
    // 动词/形容词 + 介词："depend on" 放最前
    for (const r of after) if (PREPS.has(r.word) && ok(r.word)) chunks.push(`${word} ${r.word}`)
    for (const r of after) if (!FILLER.has(r.word) && !PREPS.has(r.word) && ok(r.word)) chunks.push(`${word} ${r.word}`)
    for (const r of adjs.slice(0, 4)) if (ok(r.word)) chunks.push(`${r.word} ${word}`)
    for (const r of before) if (!FILLER.has(r.word) && !PREPS.has(r.word) && ok(r.word)) chunks.push(`${r.word} ${word}`)
    return uniq(chunks)
      .slice(0, 5)
      .map((en) => ({ en }))
  })
}

// ---------- 在线：图片 / online image ----------

async function fetchImageOnline(query: string, pixabayKey?: string): Promise<string | undefined> {
  const key = `img:${query}`
  const hit = readCache<string | null>(key)
  if (hit !== undefined) return hit ?? undefined

  const q = encodeURIComponent(query)
  const providers: Array<() => Promise<string | undefined>> = []
  if (pixabayKey) {
    providers.push(async () => {
      const d = await getJson(`https://pixabay.com/api/?key=${encodeURIComponent(pixabayKey)}&q=${q}&image_type=photo&safesearch=true&per_page=3`)
      return d.hits?.[0]?.webformatURL
    })
  }
  providers.push(async () => {
    const d = await getJson(`https://api.openverse.org/v1/images/?q=${q}&page_size=1&mature=false`)
    return d.results?.[0]?.thumbnail ?? d.results?.[0]?.url
  })
  providers.push(async () => {
    const d = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`)
    return d.type === 'disambiguation' ? undefined : d.thumbnail?.source
  })

  for (const p of providers) {
    try {
      const url = await p()
      if (url) {
        writeCache(key, url)
        return url
      }
    } catch {
      // 换下一个来源 / try next provider
    }
  }
  writeCache(key, null)
  return undefined
}

// ---------- 对外接口 / public API ----------

/** 同步部分：不需要网络就能拿到的信息 / what we know without network */
export function getLocalExtras(word: Word): WordExtras {
  return {
    pos: word.pos?.length ? word.pos.map(normalizePos) : parsePosFromTrans(word.trans),
    chunks: word.chunks ?? [],
    image: word.image,
  }
}

export async function loadWordExtras(word: Word, opts: ExtrasOptions): Promise<WordExtras> {
  const overlay = (await loadOverlay(opts.dictId))[word.name] ?? {}
  const local = getLocalExtras({ ...overlay, ...word, pos: word.pos ?? overlay.pos, chunks: word.chunks ?? overlay.chunks } as Word)
  const imageQuery = word.imageQuery ?? overlay.imageQuery ?? word.name
  const image = word.image ?? overlay.image

  if (!opts.onlineLookup) return { ...local, image }

  const [pos, chunks, img] = await Promise.all([
    local.pos.length ? local.pos : fetchPosOnline(word.name),
    local.chunks.length ? local.chunks : fetchChunksOnline(word.name),
    image ? image : fetchImageOnline(imageQuery, opts.pixabayKey),
  ])
  return { pos, chunks, image: img }
}

/** 把语块中的目标词遮住（默写模式用）/ mask the target word in a chunk for dictation mode */
export function maskWord(text: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 也遮住常见变形：cancel → cancelled / cancels / cancelling
  return text.replace(new RegExp(`\\b${escaped}\\w*`, 'gi'), (m) => '_'.repeat(Math.max(3, m.length)))
}
