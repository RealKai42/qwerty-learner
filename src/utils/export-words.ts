import { idDictionaryMap } from '@/resources/dictionary'
import { wordListFetcher } from '@/utils/wordListFetcher'
import type { Word } from '@/typings'

export interface ExportWordInput {
  word: string
  dict: string
  wrongCount?: number
}

export interface ResolvedExportRow {
  word: string
  translation: string
  dictName: string
  wrongCount?: number
}

function formatTimestamp(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`
}

/**
 * 收集去重 dict urls → 拉取词库 JSON → 解析每个单词的释义与词库名。
 * 单个词库拉取失败记日志并返回空列表, 不影响其他词库。
 */
export async function resolveExportRows(items: ExportWordInput[]): Promise<ResolvedExportRow[]> {
  const dictUrls: string[] = []
  items.forEach((item) => {
    const dictInfo = idDictionaryMap[item.dict]
    if (dictInfo?.url && !dictUrls.includes(dictInfo.url)) {
      dictUrls.push(dictInfo.url)
    }
  })

  const dictDataPromises = dictUrls.map(async (url) => {
    try {
      const data: Word[] = await wordListFetcher(url)
      return { url, data }
    } catch (error) {
      console.error(`Failed to fetch dictionary data from ${url}:`, error)
      return { url, data: [] as Word[] }
    }
  })

  const dictDataResults = await Promise.all(dictDataPromises)
  const dictDataMap = new Map(dictDataResults.map((result) => [result.url, result.data]))

  return items.map((item) => {
    const dictInfo = idDictionaryMap[item.dict]
    let translation = ''

    if (dictInfo?.url && dictDataMap.has(dictInfo.url)) {
      const wordList = dictDataMap.get(dictInfo.url) || []
      const word = wordList.find((w) => w.name === item.word)
      translation = word && word.trans ? (Array.isArray(word.trans) ? word.trans.join('；') : String(word.trans)) : ''
    }

    return {
      word: item.word,
      translation,
      dictName: dictInfo?.name || item.dict,
      ...(item.wrongCount !== undefined ? { wrongCount: item.wrongCount } : {}),
    }
  })
}

/** 生成 xlsx/csv Blob 并触发下载。xlsx 与 file-saver 均为懒加载。 */
export async function saveExportFile(
  exportData: Array<Record<string, string | number>>,
  filenamePrefix: string,
  format: 'xlsx' | 'csv',
): Promise<void> {
  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excelBuffer = XLSX.write(workbook, { bookType: format as any, type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

  const timestamp = formatTimestamp(new Date())
  const fileName = `${filenamePrefix}_${timestamp}.${format}`

  const { saveAs } = await import('file-saver')
  saveAs(blob, fileName)
}
