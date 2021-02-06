export type Dictionary = {
  id: string
  name: string
  url: string
  length: number
}

export const dictionaries: Dictionary[] = [
  { id: 'cet4', name: 'CET-4', url: '', length: 2607 },
  { id: 'cet6', name: 'CET-6', url: './dicts/CET6_N.json', length: 2345 },
  { id: 'gmat', name: 'GMAT', url: './dicts/GMAT_N.json', length: 3047 },
  { id: 'gre', name: 'GRE', url: './dicts/GRE_N.json', length: 6515 },
  { id: 'ielts', name: 'IELTS', url: './dicts/IELTS_N.json', length: 3575 },
  { id: 'kaoyan', name: '考研', url: './dicts/KaoYan_N.json', length: 3728 },
  { id: 'level4', name: '专四', url: './dicts/Level4_N.json', length: 4025 },
  { id: 'level8', name: '专八', url: './dicts/Level8_N.json', length: 12197 },
  { id: 'sat', name: 'SAT', url: './dicts/SAT_N.json', length: 4464 },
  { id: 'toefl', name: 'TOEFL', url: './dicts/TOEFL_N.json', length: 4264 },
  { id: 'coder', name: 'Coder Dict', url: './dicts/it-words.json', length: 1700 },
  { id: 'jsArray', name: 'js-array', url: './dicts/js-array.json', length: 36 },
  { id: 'jsDate', name: 'js-date', url: './dicts/js-date.json', length: 34 },
  { id: 'jsGlobal', name: 'js-global', url: './dicts/js-global.json', length: 9 },
  { id: 'jsMapSet', name: 'js-map-set', url: './dicts/js-map-set.json', length: 16 },
  { id: 'jsMath', name: 'js-math', url: './dicts/js-math.json', length: 38 },
  { id: 'jsNumber', name: 'js-number', url: './dicts/js-number.json', length: 22 },
  { id: 'jsObject', name: 'js-object', url: './dicts/js-object.json', length: 37 },
  { id: 'jsPromise', name: 'js-promise', url: './dicts/js-promise.json', length: 9 },
  { id: 'jsString', name: 'js-string', url: './dicts/js-string.json', length: 32 },
]

export const idDictionaryMap: Record<string, Dictionary> = Object.fromEntries(dictionaries.map((dict) => [dict.id, dict]))
