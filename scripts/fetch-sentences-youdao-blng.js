#!/usr/bin/env node
/**
 * scripts/fetch-sentences-youdao-blng.js
 *
 * 从有道 blng_sents_part（双语例句）字段抓取例句，仅为 sentences 为空的词补齐。
 */
const fs = require('fs')
const path = require('path')
const httpGet = require('./http-get')

const INTERVAL_MS = Number(process.env.INTERVAL_MS || 350)
const MAX_PER_WORD = Number(process.env.MAX_PER_WORD || 1)

const target = process.argv[2]
if (!target) {
  console.error('Usage: node scripts/fetch-sentences-youdao-blng.js <dict-json-path>')
  process.exit(1)
}
const absPath = path.resolve(target)
const words = JSON.parse(fs.readFileSync(absPath, 'utf8'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const BLOCKED_KEYWORDS =
  /\b(sex|drug|kill|murder|arrest|marijuana|whisky|violence|bomb|virgin|breast|nude|porn|corpse|apartheid|racism|terror)/i

function decodeJsString(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsTarget(english, target) {
  const t = target.trim().toLowerCase()
  if (!t) return false
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(^|[^A-Za-z0-9'])${escaped}([^A-Za-z0-9']|$)`, 'i')
  return re.test(english)
}

function passQualityFilter(english, chinese) {
  if (/[""]/.test(chinese)) return false
  if (/[!?]{2,}/.test(english)) return false
  if (BLOCKED_KEYWORDS.test(english)) return false
  const words = english.split(/\s+/)
  if (words.length > 14) return false
  if (english.length > 100) return false
  if (chinese.length > 35) return false
  return true
}

function parseYoudaoBlng(html, target) {
  const idx = html.indexOf('blng_sents_part:{')
  if (idx < 0) return []
  const region = html.slice(idx, idx + 40000)
  const pairRe = /\{sentence:"((?:[^"\\]|\\.)*)"[^{}]*?"sentence-translation":"((?:[^"\\]|\\.)*)"/g
  const candidates = []
  let m
  while ((m = pairRe.exec(region)) !== null) {
    const english = decodeJsString(m[1])
    const chinese = decodeJsString(m[2])
    if (!english || !chinese) continue
    if (!/[A-Za-z]/.test(english) || !/[\u4e00-\u9fa5]/.test(chinese)) continue
    if (target && !containsTarget(english, target)) continue
    if (!passQualityFilter(english, chinese)) continue
    candidates.push({ english, chinese, len: english.length })
  }
  candidates.sort((a, b) => a.len - b.len)
  return candidates.slice(0, MAX_PER_WORD).map((c) => ({ english: c.english, chinese: c.chinese }))
}

async function fetchSentences(word) {
  const url = `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`
  const html = await httpGet(url)
  return parseYoudaoBlng(html, word)
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
    fs.writeFileSync(path.resolve(process.cwd(), 'scripts/missing-sentences.txt'), missing.join('\n') + '\n', 'utf8')
    console.log('Missing list saved to scripts/missing-sentences.txt')
  }
})()
