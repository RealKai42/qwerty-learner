#!/usr/bin/env node
/**
 * 用 Claude 为整本词库批量生成：词性 + 语块（带中文）+ 搜图关键词
 * Generate POS + chunks (with Chinese) + image keyword for a whole dictionary with Claude.
 *
 * 用法 / Usage:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node scripts/enrich-dict.mjs cet4 public/dicts/CET4_T.json
 *   node scripts/enrich-dict.mjs cet4 public/dicts/CET4_T.json --limit 200   # 只做前 200 个
 *
 * 输出 / Output: public/extras/<dictId>.json   （网页会自动读取）
 * 可以中断后重跑：已经生成过的单词会跳过 / Safe to re-run: finished words are skipped.
 */
import fs from 'node:fs'
import path from 'node:path'

const [dictId, dictPath, ...rest] = process.argv.slice(2)
if (!dictId || !dictPath) {
  console.error('Usage: node scripts/enrich-dict.mjs <dictId> <path/to/dict.json> [--limit N] [--batch N] [--model M]')
  process.exit(1)
}
const arg = (name, def) => {
  const i = rest.indexOf(`--${name}`)
  return i >= 0 ? rest[i + 1] : def
}
const LIMIT = Number(arg('limit', Infinity))
const BATCH = Number(arg('batch', 40))
const MODEL = arg('model', 'claude-haiku-5-5')
const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('请先设置 ANTHROPIC_API_KEY / Please set ANTHROPIC_API_KEY')
  process.exit(1)
}

const outPath = path.join('public', 'extras', `${dictId}.json`)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {}
const words = JSON.parse(fs.readFileSync(dictPath, 'utf8')).slice(0, LIMIT)
const todo = words.filter((w) => !out[w.name])
console.log(`${words.length} words, ${todo.length} to do → ${outPath}`)

const PROMPT = `You help Chinese learners of English. For each word below, return:
- "pos": parts of speech actually used for the given Chinese meanings, as abbreviations from: n. v. vt. vi. adj. adv. prep. conj. pron. int. num. abbr.
- "chunks": 3 high-frequency, natural chunks/collocations containing the word (2-5 words each, the kind a native speaker really says, e.g. "cancel a meeting", "depend on"), each with a short Chinese translation in "zh".
- "imageQuery": 1-3 English words for searching a stock photo that best illustrates the word (for abstract words, pick a concrete scene, e.g. "persistent" → "climber mountain").
Reply with ONLY a JSON object keyed by the word, e.g.
{"cancel":{"pos":["v."],"chunks":[{"en":"cancel a meeting","zh":"取消会议"}],"imageQuery":"cancelled stamp"}}

Words (word: Chinese meaning):
`

async function callClaude(batch) {
  const list = batch.map((w) => `${w.name}: ${(w.trans || []).join('；')}`).join('\n')
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: PROMPT + list }] }),
    })
    if (res.ok) {
      const data = await res.json()
      const text = data.content.map((c) => c.text || '').join('')
      const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
      try {
        return JSON.parse(json)
      } catch {
        console.warn('  JSON parse failed, retrying...')
      }
    } else {
      console.warn(`  HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      if (res.status < 500 && res.status !== 429) process.exit(1)
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt))
  }
  throw new Error('Failed after retries')
}

for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH)
  const result = await callClaude(batch)
  for (const w of batch) {
    const r = result[w.name]
    if (r && Array.isArray(r.chunks)) out[w.name] = { pos: r.pos, chunks: r.chunks, imageQuery: r.imageQuery }
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 0))
  console.log(`  ${Math.min(i + BATCH, todo.length)}/${todo.length}`)
}
console.log('Done ✔')
