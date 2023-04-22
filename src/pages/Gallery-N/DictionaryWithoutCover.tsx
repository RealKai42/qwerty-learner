import { useDictStats } from './hooks/useDictStats'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import { DictionaryResource } from '@/typings'
import { calcChapterCount } from '@/utils'
import * as Progress from '@radix-ui/react-progress'
import { useRef } from 'react'

interface Props {
  dictionary: DictionaryResource
  onClick?: () => void
}

function Dictionary({ dictionary, onClick }: Props) {
  const divRef = useRef<HTMLDivElement>(null)

  const entry = useIntersectionObserver(divRef, {})
  const isVisible = !!entry?.isIntersecting
  const DictStats = useDictStats(dictionary.id, isVisible)
  const chapterCount = calcChapterCount(dictionary.length)
  const progress = DictStats ? DictStats.exercisedChapterCount / chapterCount : 0

  return (
    <div
      ref={divRef}
      className="flex items-center justify-center w-60 overflow-hidden rounded-md border border-gray-300 bg-gray-50 p-4 text-left shadow-lg focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:bg-opacity-10"
      onClick={onClick}
    >
      <div className="w-full flex flex-col items-start justify-start h-full ">
        <h1 className="text-xl font-normal mb-1">{dictionary.name}</h1>
        <p className="text-xs text-gray-600 mb-1">{dictionary.description}</p>
        <p className="text-sm font-bold text-gray-600 mb-1">{dictionary.length} 词</p>
        <div className="flex items-center mb-0 w-full">
          <Progress.Root value={progress} max={100} className="h-3.5 w-full rounded-full bg-white mr-4 border-2 border-indigo-300">
            <Progress.Indicator
              className="-translate-x-px h-full pl-0 rounded-full bg-indigo-300"
              style={{ width: `calc(${progress}% + 2px)` }}
            />
          </Progress.Root>
        </div>
      </div>
    </div>
  )
}

export default Dictionary
