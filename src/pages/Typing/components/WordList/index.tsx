import { TypingStateActionType, useTypingContext } from '../../store'
import WordCard from './WordCard'
import Drawer from '@/components/Drawer'
import Tooltip from '@/components/Tooltip'
import { currentChapterAtom, currentDictInfoAtom, isReviewModeAtom } from '@/store'
import { Dialog } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ListIcon from '~icons/tabler/list'
import IconX from '~icons/tabler/x'

const currentDictTitle = atom((get) => {
  const isReviewMode = get(isReviewModeAtom)
  const dictName = get(currentDictInfoAtom).name
  const chapter = get(currentChapterAtom) + 1

  // Note: i18n t() cannot be used inside a Jotai atom (not a React component).
  // The title is computed in the component below using t() instead.
  return { dictName, chapter, isReviewMode }
})

export default function WordList() {
  const { t } = useTranslation()
  const { state, dispatch } = useTypingContext()

  const [isOpen, setIsOpen] = useState(false)
  const titleData = useAtomValue(currentDictTitle)
  const currentDictTitleValue = titleData.isReviewMode
    ? t('typing.wordList.reviewTitle', { dictName: titleData.dictName })
    : t('typing.wordList.chapterTitle', { dictName: titleData.dictName, chapter: titleData.chapter })

  function closeModal() {
    setIsOpen(false)
    dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
  }

  function openModal() {
    setIsOpen(true)
    dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
  }

  return (
    <>
      <Tooltip content="List" placement="top" className="absolute! left-5 top-[50%] z-20">
        <button
          type="button"
          onClick={openModal}
          aria-label={currentDictTitleValue}
          className="fixed left-0 top-[50%] z-20 rounded-lg rounded-l-none bg-indigo-50 px-2 py-3 text-lg hover:bg-indigo-200 focus:outline-none dark:bg-indigo-900 dark:hover:bg-indigo-800"
        >
          <ListIcon className="h-6 w-6 text-lg text-indigo-500 dark:text-white" />
        </button>
      </Tooltip>

      <Drawer open={isOpen} onClose={closeModal} classNames="bg-stone-50 dark:bg-gray-900">
        <Dialog.Title as="h3" className="flex items-center justify-between p-4 text-lg font-medium leading-6 dark:text-gray-50">
          {currentDictTitleValue}
          <IconX onClick={closeModal} className="cursor-pointer" />
        </Dialog.Title>
        <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
          <ScrollArea.Viewport className="h-full w-full px-3">
            <div className="flex h-full w-full flex-col gap-1">
              {state.chapterData.words?.map((word, index) => {
                return <WordCard word={word} key={`${word.name}_${index}`} isActive={state.chapterData.index === index} />
              })}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Drawer>
    </>
  )
}
