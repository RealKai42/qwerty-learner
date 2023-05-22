import DictTagSwitcher from './DictTagSwitcher'
import DictionaryComponent from './DictionaryWithoutCover'
import { GalleryContext } from './index'
import { currentDictInfoAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { findCommonValues } from '@/utils'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

export default function DictionaryGroup({ groupedDictsByTag }: { groupedDictsByTag: Record<string, Dictionary[]> }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { setState } = useContext(GalleryContext)!
  const tagList = useMemo(() => Object.keys(groupedDictsByTag), [groupedDictsByTag])
  const [currentTag, setCurrentTag] = useState(tagList[0])
  const currentDictInfo = useAtomValue(currentDictInfoAtom)

  const onChangeCurrentTag = useCallback((tag: string) => {
    setCurrentTag(tag)
  }, [])

  const onClickDict = useCallback(
    (dict: Dictionary) => {
      setState((state) => {
        state.chapterListDict = dict
      })
    },
    [setState],
  )

  useEffect(() => {
    const commonTags = findCommonValues(tagList, currentDictInfo.tags)
    if (commonTags.length > 0) {
      setCurrentTag(commonTags[0])
    }
  }, [currentDictInfo.tags, tagList])

  return (
    <div>
      <DictTagSwitcher tagList={tagList} currentTag={currentTag} onChangeCurrentTag={onChangeCurrentTag} />
      <div className="mt-8 grid gap-x-5 gap-y-10 px-1 pb-4 sm:grid-cols-1 md:grid-cols-2 dic3:grid-cols-3 dic4:grid-cols-4">
        {groupedDictsByTag[currentTag].map((dict) => (
          <DictionaryComponent key={dict.id} dictionary={dict} onClick={() => onClickDict(dict)} />
        ))}
      </div>
    </div>
  )
}
