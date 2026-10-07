import { TypingContext, TypingStateActionType } from '../../store'
import WordCard from './WordCard'
import Drawer from '@/components/Drawer'
import Tooltip from '@/components/Tooltip'
import { useDefinitionSpeech } from '@/contexts/DefinitionSpeechContext'
import { currentChapterAtom, currentDictInfoAtom, isReviewModeAtom } from '@/store'
import { stopWordPlayback } from '@/utils/audioPlaybackCoordinator'
import { Dialog } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { atom, useAtomValue } from 'jotai'
import { useContext, useEffect, useState } from 'react'
import ListIcon from '~icons/tabler/list'
import IconX from '~icons/tabler/x'

const currentDictTitle = atom((get) => {
  const isReviewMode = get(isReviewModeAtom)

  if (isReviewMode) {
    return `${get(currentDictInfoAtom).name} 错题复习`
  } else {
    return `${get(currentDictInfoAtom).name} 第 ${get(currentChapterAtom) + 1} 章`
  }
})

export default function WordList() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!

  const [isOpen, setIsOpen] = useState(false)
  const currentDictTitleValue = useAtomValue(currentDictTitle)
  const { cancel, error } = useDefinitionSpeech()

  function closeModal() {
    cancel()
    stopWordPlayback()
    setIsOpen(false)
  }

  function openModal() {
    cancel()
    stopWordPlayback()
    setIsOpen(true)
    dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
  }

  useEffect(() => {
    return () => {
      cancel()
      stopWordPlayback()
    }
  }, [cancel])

  return (
    <>
      <Tooltip content="List" placement="top" className="!absolute left-5 top-[50%] z-20">
        <button
          type="button"
          onClick={openModal}
          aria-label="打开章节词表"
          className="fixed left-0 top-[50%] z-20 rounded-lg rounded-l-none bg-indigo-50 px-2 py-3 text-lg hover:bg-indigo-200 focus:outline-none dark:bg-indigo-900 dark:hover:bg-indigo-800"
        >
          <ListIcon className="h-6 w-6 text-lg text-indigo-500 dark:text-white" />
        </button>
      </Tooltip>

      <Drawer open={isOpen} onClose={closeModal} classNames="bg-stone-50 dark:bg-gray-900">
        <Dialog.Title as="h3" className="flex items-center justify-between p-4 text-lg font-medium leading-6 dark:text-gray-50">
          <span>
            {currentDictTitleValue}
            {error && (
              <span className="mt-1 block max-w-md text-xs font-normal text-red-500" role="status">
                {error}
              </span>
            )}
          </span>
          <button type="button" onClick={closeModal} aria-label="关闭章节词表" className="focus:outline-none">
            <IconX className="cursor-pointer" />
          </button>
        </Dialog.Title>
        <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
          <ScrollArea.Viewport className="h-full w-full px-3">
            <div className="flex h-full w-full flex-col gap-1">
              {state.chapterData.words?.map((word, index) => {
                return (
                  <WordCard
                    word={word}
                    key={`${word.name}_${index}`}
                    isActive={state.chapterData.index === index}
                    speechId={`list:${currentDictTitleValue}:${index}:${word.name}`}
                  />
                )
              })}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Drawer>
    </>
  )
}
