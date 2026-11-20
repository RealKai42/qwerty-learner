import { currentDictIdAtom, proficiencyMapAtom } from '@/store'
import { db } from '@/utils/db'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

/**
 * 加载并缓存当前词典的单词熟练度数据
 */
export function useProficiencyData() {
  const dictId = useAtomValue(currentDictIdAtom)
  const setProficiencyMap = useSetAtom(proficiencyMapAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProficiencyData() {
      try {
        setIsLoading(true)
        setError(null)

        // 获取当前词典的所有单词熟练度数据
        const proficiencyRecords = await db.wordProficiency.where({ dict: dictId }).toArray()

        // 将数据转换为 Map 以便快速查找
        const proficiencyMap = new Map()
        proficiencyRecords.forEach((record) => {
          proficiencyMap.set(record.word, {
            status: record.status,
            rememberedUntil: record.rememberedUntil,
          })
        })

        // 更新全局状态
        setProficiencyMap(proficiencyMap)
      } catch (err) {
        console.error('加载熟练度数据出错:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    loadProficiencyData()
  }, [dictId, setProficiencyMap])

  return { isLoading, error }
}

export default useProficiencyData
