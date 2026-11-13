import type { IFavoriteRecord } from '@/utils/db/record'
import { wordListFetcher } from '@/utils/wordListFetcher'
import type { Dictionary, Word } from '@/typings'

/**
 * 拉取词库 JSON, 把该词库的收藏单词映射为完整 Word 对象, 供收藏练习使用。
 * 收藏顺序与收藏页一致(收藏时间倒序), 未命中词库的收藏词跳过。
 */
export async function buildFavoriteWords(favorites: IFavoriteRecord[], dict: Dictionary): Promise<Word[]> {
  const dictFavorites = favorites.filter((f) => f.dict === dict.id)
  const wordList = await wordListFetcher(dict.url)
  const wordMap = new Map(wordList.map((w) => [w.name, w]))
  return dictFavorites.map((f) => wordMap.get(f.word)).filter((w): w is Word => !!w)
}
