#!/usr/bin/env node
/**
 * scripts/fetch-sentences.js
 *
 * 从有道词典公开网页抓取例句，为 public/dicts/<dict>.json 中每个词补齐 sentences 字段。
 *
 * Usage:
 *   node scripts/fetch-sentences.js public/dicts/beijing_primary_english.json
 *
 * Options via env:
 *   INTERVAL_MS=300   请求间隔
 *   MAX_PER_WORD=1    每词保留几条例句
 *   RESUME=1          已存在 sentences 的词跳过
 */

const fs = require('fs')
const path = require('path')
const httpGet = require('./http-get')

const INTERVAL_MS = Number(process.env.INTERVAL_MS || 300)
const MAX_PER_WORD = Number(process.env.MAX_PER_WORD || 1)
const RESUME = process.env.RESUME !== '0'

const target = process.argv[2]
if (!target) {
  console.error('Usage: node scripts/fetch-sentences.js <dict-json-path>')
  process.exit(1)
}

const absPath = path.resolve(target)
const raw = fs.readFileSync(absPath, 'utf8')
const words = JSON.parse(raw)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function parseYoudao(html) {
  const result = []
  const idx = html.indexOf('examples:[')
  if (idx < 0) return result

  const region = html.slice(idx, idx + 20000)
  const itemRe = /\{sense:\{[^{}]*word:"((?:[^"\\]|\\.)*)"\}[^{}]*example:"((?:[^"\\]|\\.)*)"\}/g
  let m
  while ((m = itemRe.exec(region)) !== null) {
    const chinese = decodeJsString(m[1])
    const english = decodeJsString(m[2])
    if (!/[A-Za-z]/.test(english) || !/[\u4e00-\u9fa5]/.test(chinese)) continue
    result.push({ english, chinese })
    if (result.length >= MAX_PER_WORD) break
  }
  return result
}

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

async function fetchSentences(word) {
  const url = `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`
  const html = await httpGet(url)
  return parseYoudao(html)
}

;(async () => {
  const missing = []
  let done = 0
  const started = Date.now()
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (RESUME && Array.isArray(w.sentences) && w.sentences.length > 0) continue

    try {
      const s = await fetchSentences(w.name)
      if (s.length > 0) {
        w.sentences = s
        done++
      } else {
        missing.push(w.name)
      }
    } catch (e) {
      missing.push(w.name)
      console.error(`[${i + 1}/${words.length}] ${w.name} ERROR:`, e.message)
    }

    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(absPath, JSON.stringify(words, null, 2), 'utf8')
      const elapsed = ((Date.now() - started) / 1000).toFixed(1)
      console.log(`[progress] ${i + 1}/${words.length}  ok=${done}  miss=${missing.length}  ${elapsed}s`)
    }
    await sleep(INTERVAL_MS)
  }

  fs.writeFileSync(absPath, JSON.stringify(words, null, 2), 'utf8')
  console.log(`\nDONE. ok=${done}, miss=${missing.length}`)
  if (missing.length > 0) {
    const outPath = path.resolve(process.cwd(), 'scripts/missing-sentences.txt')
    fs.writeFileSync(outPath, missing.join('\n') + '\n', 'utf8')
    console.log(`Missing list saved to ${outPath}`)
  }
})()
