#!/usr/bin/env node
/**
 * scripts/fetch-sentences-bing.js
 *
 * Bing Dict 例句抓取。仅为 sentences 为空的词补齐。
 *
 * Usage:
 *   node scripts/fetch-sentences-bing.js public/dicts/beijing_primary_english.json
 *
 * Env:
 *   INTERVAL_MS=400
 *   MAX_PER_WORD=1
 */

const fs = require('fs')
const path = require('path')
const httpGet = require('./http-get')

const INTERVAL_MS = Number(process.env.INTERVAL_MS || 400)
const MAX_PER_WORD = Number(process.env.MAX_PER_WORD || 1)

const target = process.argv[2]
if (!target) {
  console.error('Usage: node scripts/fetch-sentences-bing.js <dict-json-path>')
  process.exit(1)
}
const absPath = path.resolve(target)
const words = JSON.parse(fs.readFileSync(absPath, 'utf8'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBlocks(html, className) {
  const results = []
  const marker = `class="${className}`
  let idx = 0
  while ((idx = html.indexOf(marker, idx)) !== -1) {
    const gtIdx = html.indexOf('>', idx)
    if (gtIdx < 0) break
    let depth = 1
    let i = gtIdx + 1
    let out = ''
    while (i < html.length && depth > 0) {
      if (html.startsWith('</div>', i)) {
        depth--
        i += 6
        if (depth === 0) break
        out += '</div>'
      } else if (html.startsWith('<div', i)) {
        depth++
        const end = html.indexOf('>', i)
        out += html.slice(i, end + 1)
        i = end + 1
      } else {
        out += html[i]
        i++
      }
    }
    results.push(out)
    idx = i
    if (results.length > MAX_PER_WORD * 3) break
  }
  return results
}

const BLOCKED_KEYWORDS =
  /\b(sex|drug|kill|gun|murder|arrest|police|marijuana|alcohol|whisky|beer|violence|bomb|weapon|virgin|breast|nude|adult|porn|dead|corpse|burglarized|apartheid|racism|terror|weapon)/i

function containsTarget(english, target) {
  const t = target.trim().toLowerCase()
  if (!t) return false
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(^|[^A-Za-z0-9'])${escaped}([^A-Za-z0-9']|$)`, 'i')
  return re.test(english)
}

function passQualityFilter(english, chinese) {
  if (/["`""]/.test(english)) return false
  if (/[""]/.test(chinese)) return false
  if (/[!?]{2,}/.test(english)) return false
  if (BLOCKED_KEYWORDS.test(english)) return false
  const words = english.split(/\s+/)
  if (words.length > 14) return false
  if (english.length > 100) return false
  if (chinese.length > 35) return false
  const shouty = words.filter((w) => /^[A-Z]{3,}$/.test(w))
  if (shouty.length > 1) return false
  return true
}

function parseBing(html, target) {
  const results = []
  const enBlocks = extractBlocks(html, 'sen_en b_regtxt')
  const cnBlocks = extractBlocks(html, 'sen_cn b_regtxt')
  const n = Math.min(enBlocks.length, cnBlocks.length)
  const candidates = []
  for (let i = 0; i < n; i++) {
    const english = stripTags(enBlocks[i])
    const chinese = stripTags(cnBlocks[i])
    if (!english || !chinese) continue
    if (!/[A-Za-z]/.test(english) || !/[\u4e00-\u9fa5]/.test(chinese)) continue
    if (!passQualityFilter(english, chinese)) continue
    if (target && !containsTarget(english, target)) continue
    candidates.push({ english, chinese, len: english.length })
  }
  candidates.sort((a, b) => a.len - b.len)
  for (const c of candidates) {
    if (results.length >= MAX_PER_WORD) break
    results.push({ english: c.english, chinese: c.chinese })
  }
  return results
}

async function fetchSentences(word) {
  const url = `https://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`
  const html = await httpGet(url)
  return parseBing(html, word)
}

;(async () => {
  const missing = []
  let filled = 0
  let scanned = 0
  const started = Date.now()

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (Array.isArray(w.sentences) && w.sentences.length > 0) continue
    scanned++
    try {
      const s = await fetchSentences(w.name)
      if (s.length > 0) {
        w.sentences = s
        filled++
      } else {
        missing.push(w.name)
      }
    } catch (e) {
      missing.push(w.name)
      console.error(`[${i + 1}] ${w.name} ERROR:`, e.message)
    }
    if (scanned % 15 === 0) {
      fs.writeFileSync(absPath, JSON.stringify(words, null, 2), 'utf8')
      const elapsed = ((Date.now() - started) / 1000).toFixed(1)
      console.log(`[progress] scanned=${scanned}  filled=${filled}  missing=${missing.length}  ${elapsed}s`)
    }
    await sleep(INTERVAL_MS)
  }

  fs.writeFileSync(absPath, JSON.stringify(words, null, 2), 'utf8')
  console.log(`\nDONE. scanned=${scanned}  filled=${filled}  missing=${missing.length}`)
  if (missing.length > 0) {
    const outPath = path.resolve(process.cwd(), 'scripts/missing-sentences.txt')
    fs.writeFileSync(outPath, missing.join('\n') + '\n', 'utf8')
    console.log(`Missing list saved to ${outPath}`)
  }
})()
