import CategoryNavigation from './CategoryNavigation'
import ChapterList from './ChapterList'
import DictTagSwitcher from './DictTagSwitcher'
import Dictionary from './Dictionary'
import { LanguageTabSwitcher, TabList } from './LanguageTabSwitcher'
import Layout from '@/components/Layout'
import { createContext } from 'react'
import { Updater, useImmer } from 'use-immer'

export type GalleryState = {
  currentLanguageTab: TabList
}

export const GalleryContext = createContext<{ state: GalleryState; setState: Updater<GalleryState> } | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>({ currentLanguageTab: 'en' })

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <div className="mb-auto mt-auto flex w-full overflow-y-auto flex-col pl-20">
          <div className="w-full mt-20 flex justify-center ">
            <LanguageTabSwitcher />
          </div>
          <div className="flex items-start justify-center w-full mt-5 overflow-y-auto">
            <ChapterList />
            <div className="overflow-y-auto h-full max-h-full">
              <div className="customized-scrollbar overflow-y-auto mr-4 flex-1">
                <DictTagSwitcher />
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                    <Dictionary key={item} />
                  ))}
                </div>
                <div className="w-full bg-gray-300 text-center mt-10">词典标签</div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                    <Dictionary key={item} />
                  ))}
                </div>
                <div className="w-full bg-gray-300 text-center mt-10">词典标签</div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
                    <Dictionary key={item} />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-40 text-center mt-20 w-40 h-40 ">
              <CategoryNavigation />
            </div>
          </div>
        </div>
      </GalleryContext.Provider>
    </Layout>
  )
}
