// 将 data/data-*.js（雅思词汇真经 章节同步版）转换为 public/dicts 下的词典 JSON
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const CHAPTERS = [
  '自然地理',
  '植物研究',
  '动物保护',
  '太空探索',
  '学校教育',
  '科技发明',
  '文化历史',
  '语言演化',
  '娱乐运动',
  '物品材料',
  '时尚潮流',
  '饮食健康',
  '建筑场所',
  '交通旅行',
  '国家政府',
  '社会经济',
  '法律法规',
  '征战沙场',
  '社会关系',
  '行为动作',
  '身心健康',
  '时间日期',
]

const root = path.join(__dirname, '..')

// "/ˈætməsfɪə/" -> "ˈætməsfɪə"；"n. /'prəʊses/ v. /prə'ses/" -> "n. 'prəʊses v. prə'ses"
const cleanPhonetic = (p) => (p || '').replace(/\//g, ' ').replace(/\s+/g, ' ').trim()

const entries = []
CHAPTERS.forEach((title, i) => {
  const no = i + 1
  const ctx = {}
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data', `data-${no}.js`), 'utf-8'), ctx)

  const seen = new Set()
  const words = []
  for (const w of ctx.vocabulary) {
    const name = w.word.trim()
    const meaning = w.meaningCN.trim()
    // 同一章内单词和释义完全相同的重复条目只保留一条
    const key = `${name.toLowerCase()}|${meaning}`
    if (seen.has(key)) {
      console.error(`第${no}章 去重: ${name}`)
      continue
    }
    seen.add(key)

    const pos = (w.pos || '').trim()
    const phone = cleanPhonetic(w.phonetic)
    words.push({
      name,
      trans: [pos ? `${pos} ${meaning}` : meaning],
      usphone: phone,
      ukphone: phone,
    })
  }

  const pad = String(no).padStart(2, '0')
  const fileName = `IELTSVocabularyBible_Sync_${pad}.json`
  fs.writeFileSync(path.join(root, 'public', 'dicts', fileName), JSON.stringify(words, null, 2) + '\n')

  entries.push(`  {
    id: 'IELTSVocabularyBible-sync-${pad}',
    name: '雅思词汇真经（章节同步版）第${no}章 ${title}',
    description: '雅思词汇真经（章节同步版）第${no}章 ${title}，与原书章节一致',
    category: '国际考试',
    tags: ['IELTS'],
    url: '/dicts/${fileName}',
    length: ${words.length},
    language: 'en',
    languageCategory: 'en',
  },`)
})

fs.writeFileSync(path.join(__dirname, 'ielts-zhenjing-entries.txt'), entries.join('\n') + '\n')
console.error('done')
