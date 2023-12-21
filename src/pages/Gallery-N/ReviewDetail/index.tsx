import type { TErrorWordData } from '../hooks/useErrorWords'
import { Button } from '@/components/ui/button'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { timeStamp2String } from '@/utils'
import { generateNewWordReviewRecord, useGetLatestReviewRecord } from '@/utils/db/review-record'
import * as Progress from '@radix-ui/react-progress'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

export function ReviewDetail({ errorData, dict }: { errorData: TErrorWordData[]; dict: Dictionary }) {
  const latestReviewRecord = useGetLatestReviewRecord(dict.id)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const navigate = useNavigate()
  const setCurrentChapter = useSetAtom(currentChapterAtom)

  const startReview = async () => {
    setCurrentDictId(dict.id)
    setCurrentChapter(-1)

    const record = await generateNewWordReviewRecord(dict.id, errorData)
    setReviewModeInfo({ isReviewMode: true, reviewRecord: record })
    navigate('/')
  }

  const continueReview = () => {
    setCurrentDictId(dict.id)
    setCurrentChapter(-1)

    setReviewModeInfo({ isReviewMode: true, reviewRecord: latestReviewRecord })
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-60">
      {latestReviewRecord && (
        <>
          <div className=" ml-10 flex w-full items-center py-0">
            <Progress.Root
              value={latestReviewRecord.index + 1}
              max={latestReviewRecord.words.length}
              className="mr-4 h-2 w-full rounded-full border  border-indigo-400 bg-white"
            >
              <Progress.Indicator
                className="h-full rounded-full bg-indigo-400 pl-0"
                style={{ width: `calc(${((latestReviewRecord.index + 1) / latestReviewRecord.words.length) * 100}% )` }}
              />
            </Progress.Root>
            <span className="p-0 text-xs">
              {latestReviewRecord.index + 1}/{latestReviewRecord.words.length}
            </span>
          </div>
          <div className="mt-1 text-sm font-normal text-gray-500">{`( 创建于 ${timeStamp2String(latestReviewRecord.createTime)} )`}</div>
        </>
      )}

      {!latestReviewRecord && <div>当前词典错词数: {errorData.length}</div>}

      <div className="mt-6 flex gap-10">
        {latestReviewRecord && (
          <Button size="sm" onClick={continueReview}>
            继续当前进度
          </Button>
        )}
        <Button size="sm" onClick={startReview}>
          开始{latestReviewRecord && '新的'}复习
        </Button>
      </div>
    </div>
  )
}
