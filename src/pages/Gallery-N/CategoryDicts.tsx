import DictTagSwitcher from './DictTagSwitcher'
import DictionaryComponent from './DictionaryWithoutCover'
import { currentDictInfoAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { findCommonValues } from '@/utils'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function DictionaryGroup({ groupedDictsByTag }: { groupedDictsByTag: Record<string, Dictionary[]> }) {
  const tagList = useMemo(() => Object.keys(groupedDictsByTag), [groupedDictsByTag])
  const [currentTag, setCurrentTag] = useState(tagList.length > 0 ? tagList[0] : '')
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  const onChangeCurrentTag = useCallback((tag: string) => {
    setCurrentTag(tag)
  }, [])

  useEffect(() => {
    const commonTags = findCommonValues(tagList, currentDictInfo.tags)
    if (commonTags.length > 0) {
      setCurrentTag(commonTags[0])
    }
  }, [currentDictInfo.tags, tagList])

  return (
    // 必须约束到可视宽度：否则本节点按 max-content 撑开，
    // 标签行就永远不会超出自身，overflow-x 也就无从触发。
    <div className="w-full min-w-0">
      <DictTagSwitcher tagList={tagList} currentTag={currentTag} onChangeCurrentTag={onChangeCurrentTag} />
      {/* 卡片是固定宽度（w-80），等分列会在每列留下大片空白，
          改用 flex 换行：间距只由 gap 决定，列数随可用宽度自适应。 */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-10 px-1 pb-4">
        {currentTag && groupedDictsByTag[currentTag] ? (
          groupedDictsByTag[currentTag].map((dict) => <DictionaryComponent key={dict.id} dictionary={dict} />)
        ) : (
          <div className="w-full text-center text-gray-500">当前分类下没有可用的词典</div>
        )}
      </div>
    </div>
  )
}
