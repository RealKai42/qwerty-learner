import DictionaryGroup from './CategroyDicts.index'
import ChapterList from './ChapterList'
import { LanguageTabSwitcher, TabList } from './LanguageTabSwitcher'
import Layout from '@/components/Layout'
import { dictionaries } from '@/resources/dictionary'
import { DictionaryResource } from '@/typings'
import groupBy, { groupByDictTags } from '@/utils/groupBy'
import { createContext, useMemo } from 'react'
import { Updater, useImmer } from 'use-immer'

export type GalleryState = {
  currentLanguageTab: TabList
  showChapterList: boolean
  chapterListDict: DictionaryResource | null
}

const initialGalleryState: GalleryState = {
  currentLanguageTab: 'en',
  showChapterList: false,
  chapterListDict: null,
}

export const GalleryContext = createContext<{ state: GalleryState; setState: Updater<GalleryState> } | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>(initialGalleryState)

  const currentLanguageDicts = useMemo(
    () => dictionaries.filter((dict) => dict.language === galleryState.currentLanguageTab),
    [galleryState.currentLanguageTab],
  )
  const groupedByCategory = useMemo(() => Object.entries(groupBy(currentLanguageDicts, (dict) => dict.category)), [currentLanguageDicts])

  const groupedByCategoryAndTag: [string, Record<string, DictionaryResource[]>][] = useMemo(
    () => groupedByCategory.map(([category, dicts]) => [category, groupByDictTags(dicts)]),
    [groupedByCategory],
  )

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <ChapterList />
        <div className="mb-auto mt-auto flex w-full overflow-y-auto flex-col pl-20 flex-1">
          <div className="w-full mt-20 h-20 flex justify-center ">
            <LanguageTabSwitcher />
          </div>
          <div className="flex items-start justify-center w-full mt-5 overflow-y-auto flex-1">
            <div className="overflow-y-auto h-full max-h-full">
              <div className="customized-scrollbar overflow-y-auto mr-4 flex-1 flex flex-col justify-start items-start gap-5">
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
