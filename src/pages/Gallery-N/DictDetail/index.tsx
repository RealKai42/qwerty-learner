import Chapter from '../Chapter'
import { ErrorTable } from '../ErrorTable'
import { getRowsFromErrorWordData } from '../ErrorTable/columns'
import { ReviewDetail } from '../ReviewDetail'
import useErrorWordData from '../hooks/useErrorWords'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import type { Dictionary } from '@/typings'
import range from '@/utils/range'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IcOutlineCollectionsBookmark from '~icons/ic/outline-collections-bookmark'
import MajesticonsPaperFoldTextLine from '~icons/majesticons/paper-fold-text-line'
import PajamasReviewList from '~icons/pajamas/review-list'

enum Tab {
  Chapters = 'chapters',
  Errors = 'errors',
  Review = 'review',
}

export default function DictDetail({ dictionary: dict }: { dictionary: Dictionary }) {
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [curTab, setCurTab] = useState<Tab>(Tab.Chapters)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const navigate = useNavigate()

  const chapter = useMemo(() => (dict.id === currentDictId ? currentChapter : 0), [currentChapter, currentDictId, dict.id])
  const { errorWordData, isLoading, error } = useErrorWordData(dict)
  const tableData = useMemo(() => getRowsFromErrorWordData(errorWordData), [errorWordData])

  const onChangeChapter = useCallback(
    (index: number) => {
      setCurrentDictId(dict.id)
      setCurrentChapter(index)
      setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))
      navigate('/')
    },
    [dict.id, navigate, setCurrentChapter, setCurrentDictId, setReviewModeInfo],
  )

  return (
    <div className="flex flex-col rounded-[4rem] px-4 py-3 pl-5 text-gray-800 dark:text-gray-300">
      <div className="text relative flex h-40 flex-col gap-2">
        <h3 className="text-2xl font-semibold">{dict.name}</h3>
        <p className="mt-1">{dict.chapterCount} 章节</p>
        <p>共 {dict.length} 词</p>
        <p>{dict.description}</p>
        <div className="absolute bottom-5 right-4">
          <ToggleGroup
            type="single"
            value={curTab}
            onValueChange={(value: Tab) => {
              setCurTab(value)
            }}
          >
            <ToggleGroupItem value="chapters">
              <MajesticonsPaperFoldTextLine className="mr-1.5 text-gray-500" />
              章节选择
            </ToggleGroupItem>
            {errorWordData.length > 0 && (
              <>
                <ToggleGroupItem value="errors">
                  <IcOutlineCollectionsBookmark className="mr-1.5 text-gray-500" />
                  查看错题
                </ToggleGroupItem>
                <ToggleGroupItem value="review">
                  <PajamasReviewList className="mr-1.5 text-gray-500" />
                  错题回顾
                </ToggleGroupItem>
              </>
            )}
          </ToggleGroup>
        </div>
      </div>
      <div className="flex pl-0">
        <Tabs value={curTab} className="h-[30rem] w-full ">
          <TabsContent value={Tab.Chapters} className="h-full ">
            <ScrollArea className="h-[30rem] ">
              <div className="flex w-full flex-wrap gap-3">
                {range(0, dict.chapterCount, 1).map((index) => (
                  <Chapter
                    key={`${dict.id}-${index}`}
                    index={index}
                    checked={chapter === index}
                    dictID={dict.id}
                    onChange={onChangeChapter}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value={Tab.Errors} className="h-full">
            <ErrorTable data={tableData} isLoading={isLoading} error={error} />
          </TabsContent>
          <TabsContent value={Tab.Review} className="h-full">
            <ReviewDetail errorData={errorWordData} dict={dict} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
