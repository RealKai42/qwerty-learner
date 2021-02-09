export type Dictionary = {
  id: string
  name: string
  description: string
  category: string
  url: string
  length: number
}

/**
 * Built-in dictionaries in an array.
 * Why arrays? Because it keeps the order across browsers.
 */
export const dictionaries: Dictionary[] = [
  { id: 'cet4', name: 'CET-4', description: '大学英语四级词库', category: '英语学习', url: '', length: 2607 },
  { id: 'cet6', name: 'CET-6', description: '大学英语六级词库', category: '英语学习', url: './dicts/CET6_N.json', length: 2345 },
  { id: 'gmat', name: 'GMAT', description: 'GMAT 词库', category: '英语学习', url: './dicts/GMAT_N.json', length: 3047 },
  { id: 'gre', name: 'GRE', description: 'GRE 词库', category: '英语学习', url: './dicts/GRE_N.json', length: 6515 },
  { id: 'ielts', name: 'IELTS', description: '雅思词库', category: '英语学习', url: './dicts/IELTS_N.json', length: 3575 },
  { id: 'kaoyan', name: '考研', description: '研究生英语入学考试词库', category: '英语学习', url: './dicts/KaoYan_N.json', length: 3728 },
  { id: 'level4', name: '专四', description: '英语专业四级词库', category: '英语学习', url: './dicts/Level4_N.json', length: 4025 },
  { id: 'level8', name: '专八', description: '英语专业八级词库', category: '英语学习', url: './dicts/Level8_N.json', length: 12197 },
  {
    id: 'sat',
    name: 'SAT',
    description: '美国 SAT 考试词库',
    category: '英语学习',
    url: './dicts/SAT_N.json',
    length: 4464,
  },
  { id: 'toefl', name: 'TOEFL', description: '托福考试常见词', category: '英语学习', url: './dicts/TOEFL_N.json', length: 4264 },
  { id: 'coder', name: 'Coder Dict', description: '程序员常见单词词库', category: '代码练习', url: './dicts/it-words.json', length: 1700 },
  { id: 'jsArray', name: 'JS: Array', description: 'JavaScript API 词典', category: '代码练习', url: './dicts/js-array.json', length: 36 },
  { id: 'jsDate', name: 'JS: Date', description: 'JavaScript API 词典', category: '代码练习', url: './dicts/js-date.json', length: 34 },
  {
    id: 'jsGlobal',
    name: 'JS: Global',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-global.json',
    length: 9,
  },
  {
    id: 'jsMapSet',
    name: 'JS: Map & Set',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-map-set.json',
    length: 16,
  },
  { id: 'jsMath', name: 'JS: Math', description: 'JavaScript API 词典', category: '代码练习', url: './dicts/js-math.json', length: 38 },
  {
    id: 'jsNumber',
    name: 'JS: Number',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-number.json',
    length: 22,
  },
  {
    id: 'jsObject',
    name: 'JS: Object',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-object.json',
    length: 37,
  },
  {
    id: 'jsPromise',
    name: 'JS: Promise',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-promise.json',
    length: 9,
  },
  {
    id: 'jsString',
    name: 'JS: String',
    description: 'JavaScript API 词典',
    category: '代码练习',
    url: './dicts/js-string.json',
    length: 32,
  },
]

/**
 * An object-map from dictionary IDs to dictionary themselves.
 */
export const idDictionaryMap: Record<string, Dictionary> = Object.fromEntries(dictionaries.map((dict) => [dict.id, dict]))
