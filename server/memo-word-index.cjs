const fs = require('node:fs/promises')
const path = require('node:path')

async function loadWordIndex(root) {
  const directory = path.join(root, 'public/dicts')
  const preferred = ['CET4_T.json', 'CET6_T.json', 'IELTS_T.json', 'TOEFL_T.json']
  const files = (await fs.readdir(directory)).filter((name) => name.endsWith('.json')).sort()
  const ordered = [...preferred.filter((name) => files.includes(name)), ...files.filter((name) => !preferred.includes(name))]
  const index = new Map()
  for (const filename of ordered) {
    const entries = JSON.parse(await fs.readFile(path.join(directory, filename), 'utf8'))
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (!entry || typeof entry.name !== 'string' || !/^[a-z]/i.test(entry.name)) continue
      const key = entry.name.trim().toLowerCase()
      const existing = index.get(key) || { trans: [], usphone: '', ukphone: '' }
      if (!existing.trans.length && Array.isArray(entry.trans)) existing.trans = entry.trans.filter((item) => typeof item === 'string')
      if (!existing.usphone && typeof entry.usphone === 'string') existing.usphone = entry.usphone
      if (!existing.ukphone && typeof entry.ukphone === 'string') existing.ukphone = entry.ukphone
      index.set(key, existing)
    }
  }
  return index
}

module.exports = { loadWordIndex }
