import DictTagSwitcher from './DictTagSwitcher'
import Dictionary from './DictionaryWithoutCover'
import { GalleryContext } from './index'
import { DictionaryResource } from '@/typings'
import { useCallback, useContext, useMemo, useState } from 'react'

export default function DictionaryGroup({ groupedDictsByTag }: { groupedDictsByTag: Record<string, DictionaryResource[]> }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { setState } = useContext(GalleryContext)!
  const tagList = useMemo(() => Object.keys(groupedDictsByTag), [groupedDictsByTag])
  const [currentTag, setCurrentTag] = useState(tagList[0])

  const onChangeCurrentTag = useCallback((tag: string) => {
    setCurrentTag(tag)
  }, [])

  const onClickDict = useCallback(
    (dict: DictionaryResource) => {
      setState((state) => {
        state.chapterListDict = dict
      })
    },
    [setState],
  )

  return (
    <div>
      <DictTagSwitcher tagList={tagList} currentTag={currentTag} onChangeCurrentTag={onChangeCurrentTag} />
      <div className="mt-8 grid gap-x-5 gap-y-10 px-1 pb-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groupedDictsByTag[currentTag].map((dict) => (
          <Dictionary key={dict.id} dictionary={dict} onClick={() => onClickDict(dict)} />
        ))}
      </div>
    </div>
  )
}
