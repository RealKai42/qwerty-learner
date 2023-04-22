import DictionaryGroup from './CategroyDicts.index'
import ChapterList from './ChapterList'
import { LanguageTabSwitcher } from './LanguageTabSwitcher'
import Layout from '@/components/Layout'
import { dictionaries } from '@/resources/dictionary'
import { DictionaryResource, LanguageCategoryType } from '@/typings'
import groupBy, { groupByDictTags } from '@/utils/groupBy'
import { createContext, useMemo } from 'react'
import { Updater, useImmer } from 'use-immer'

export type GalleryState = {
  currentLanguageTab: LanguageCategoryType
  showChapterList: boolean
  chapterListDict: DictionaryResource | null
}

const initialGalleryState: GalleryState = {
  currentLanguageTab: 'en',
  showChapterList: false,
  chapterListDict: null,
}

export const GalleryContext = createContext<{
  state: GalleryState
  setState: Updater<GalleryState>
} | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>(initialGalleryState)

  const currentLanguageCategoryDicts = useMemo(
    () => dictionaries.filter((dict) => dict.languageCategory === galleryState.currentLanguageTab),
    [galleryState.currentLanguageTab],
  )
  const groupedByCategory = useMemo(
    () => Object.entries(groupBy(currentLanguageCategoryDicts, (dict) => dict.category)),
    [currentLanguageCategoryDicts],
  )

  const groupedByCategoryAndTag: [string, Record<string, DictionaryResource[]>][] = useMemo(
    () => groupedByCategory.map(([category, dicts]) => [category, groupByDictTags(dicts)]),
    [groupedByCategory],
  )

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <ChapterList />
        <div className="mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
          <div className="mt-20 flex h-20 w-full justify-center ">
            <LanguageTabSwitcher />
          </div>
          <div className="mt-5 flex w-full flex-1 items-start justify-center overflow-y-auto">
            <div className="h-full max-h-full overflow-y-auto pb-[20rem]">
              <div className="customized-scrollbar mr-4 flex flex-1 flex-col items-start justify-start gap-14 overflow-y-auto">
                {groupedByCategoryAndTag.map(([category, groupeByTag]) => (
                  <DictionaryGroup key={category} groupedDictsByTag={groupeByTag} />
                ))}
              </div>
            </div>
            {/* todo: 增加导航 */}
            {/* <div className="w-40 text-center mt-20 h-40 ">
              <CategoryNavigation />
            </div> */}
          </div>
        </div>
      </GalleryContext.Provider>
    </Layout>
  )
}
