import DictDetail from './DictDetail'
import { useDictStats } from './hooks/useDictStats'
import bookCover from '@/assets/book-cover.png'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import { currentDictIdAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { calcChapterCount } from '@/utils'
import * as Progress from '@radix-ui/react-progress'
import { useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'

interface Props {
  dictionary: Dictionary
}

export default function DictionaryComponent({ dictionary }: Props) {
  const currentDictID = useAtomValue(currentDictIdAtom)

  const divRef = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(divRef, {})
  const isVisible = !!entry?.isIntersecting
  const dictStats = useDictStats(dictionary.id, isVisible)
  const chapterCount = useMemo(() => calcChapterCount(dictionary.length), [dictionary.length])
  const isSelected = currentDictID === dictionary.id
  const progress = useMemo(
    () => (dictStats ? Math.ceil((dictStats.exercisedChapterCount / chapterCount) * 100) : 0),
    [dictStats, chapterCount],
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          ref={divRef}
          className={`group flex  h-36 w-80 cursor-pointer items-center justify-center overflow-hidden rounded-lg p-4 text-left shadow-lg focus:outline-none ${
            isSelected ? 'bg-indigo-400' : 'bg-zinc-50 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700'
          }`}
          role="button"
          // onClick={onClick}
        >
          <div className="relative ml-1 mt-2 flex h-full w-full flex-col items-start justify-start">
            <h1
              className={`mb-1.5 text-xl font-normal  ${
                isSelected ? 'text-white' : 'text-gray-800 group-hover:text-indigo-400 dark:text-gray-200'
              }`}
            >
              {dictionary.name}
            </h1>
            <TooltipProvider>
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <p
                    className={`mb-1 max-w-full truncate ${
                      isSelected ? 'text-white' : 'textdelayDuration-gray-600 dark:text-gray-200'
                    } whitespace-nowrap`}
                  >
                    {dictionary.description}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{`${dictionary.description}`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <p className={`mb-0.5 font-bold  ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-200'}`}>{dictionary.length} 词</p>
            <div className=" flex w-full items-center pt-2">
              {progress > 0 && (
                <Progress.Root
                  value={progress}
                  max={100}
                  className={`mr-4 h-2 w-full rounded-full border  bg-white ${isSelected ? 'border-indigo-600' : 'border-indigo-400'}`}
                >
                  <Progress.Indicator
                    className={`h-full rounded-full pl-0 ${isSelected ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                    style={{ width: `calc(${progress}% )` }}
                  />
                </Progress.Root>
              )}
              <img src={bookCover} className={`absolute right-3 top-3 w-16 ${isSelected ? 'opacity-50' : 'opacity-20'}`} />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[60rem] max-w-none !rounded-[20px]">
        <DictDetail dictionary={dictionary} />
      </DialogContent>
    </Dialog>
  )
}
