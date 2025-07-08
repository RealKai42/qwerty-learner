import { atom } from 'jotai'

// 单词熟练度设置，控制"记得"状态持续的默认天数
export const proficiencySettingsAtom = atom({
  rememberedDays: 7, // 默认"记得"状态持续7天
})

// 用于缓存当前加载的熟练度数据
export const proficiencyMapAtom = atom<Map<string, { status: 'known' | 'remembered' | 'unknown'; rememberedUntil?: number }>>(new Map())

// 派生atom，用于快速检查某个单词的状态
export const getWordProficiencyStatusAtom = atom(null, (get, set, word: string) => {
  const proficiencyMap = get(proficiencyMapAtom)
  return proficiencyMap.get(word) || { status: 'unknown', rememberedUntil: undefined }
})

// 根据熟练度过滤单词的atom
export const filterWordsByProficiencyAtom = atom((get, words: string[]) => {
  const proficiencyMap = get(proficiencyMapAtom)
  const now = Date.now()

  return words.filter((word) => {
    const proficiency = proficiencyMap.get(word)

    // 如果没有记录或状态是unknown，保留单词
    if (!proficiency || proficiency.status === 'unknown') {
      return true
    }

    // 如果状态是known，排除单词
    if (proficiency.status === 'known') {
      return false
    }

    // 如果状态是remembered，检查是否已过期
    if (proficiency.status === 'remembered' && proficiency.rememberedUntil) {
      return now > proficiency.rememberedUntil
    }

    return true
  })
})
